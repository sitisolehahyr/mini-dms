from datetime import UTC, datetime
from math import ceil

from sqlalchemy.orm import Session

from app.core.enums import DocumentStatus, PermissionAction, PermissionRequestStatus
from app.core.exceptions import AppException
from app.models.user import User
from app.repositories.document_repository import DocumentRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.permission_request_repository import PermissionRequestRepository
from app.schemas.common import PaginationMeta
from app.utils.file_storage import file_storage


class PermissionService:
    def __init__(self, db: Session):
        self.db = db
        self.permission_repo = PermissionRequestRepository(db)
        self.document_repo = DocumentRepository(db)
        self.notification_repo = NotificationRepository(db)

    def list_requests(self, page: int, page_size: int, status: PermissionRequestStatus | None) -> dict:
        items, total = self.permission_repo.list_paginated(page=page, page_size=page_size, status=status)
        meta = PaginationMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=max(1, ceil(total / page_size)) if total else 1,
        )
        return {"items": items, "meta": meta}

    def review_request(self, request_id: int, admin_user: User, decision: str, note: str | None) -> dict:
        permission_request = self.permission_repo.get_by_id_for_update(request_id)
        if not permission_request:
            raise AppException(status_code=404, code="REQUEST_NOT_FOUND", message="Permission request not found")

        if permission_request.status != PermissionRequestStatus.PENDING:
            raise AppException(status_code=409, code="REQUEST_ALREADY_REVIEWED", message="Request already reviewed")

        document = None
        if permission_request.document_id:
            document = self.document_repo.get_by_id_for_update(permission_request.document_id)

        files_to_delete_after_commit: list[str] = []
        files_to_rollback_on_error: list[str] = []

        if decision == "REJECT":
            permission_request.status = PermissionRequestStatus.REJECTED
            permission_request.reviewed_by = admin_user.id
            permission_request.reviewed_at = datetime.now(UTC)
            permission_request.note = note

            if document and document.locked_by_request_id == permission_request.id:
                document.status = DocumentStatus.ACTIVE
                document.locked_by_request_id = None

            if permission_request.action == PermissionAction.REPLACE and permission_request.payload:
                pending_file = permission_request.payload.get("pending_file_url")
                if pending_file:
                    files_to_delete_after_commit.append(pending_file)

        elif decision == "APPROVE":
            permission_request.status = PermissionRequestStatus.APPROVED
            permission_request.reviewed_by = admin_user.id
            permission_request.reviewed_at = datetime.now(UTC)
            permission_request.note = note

            if permission_request.action == PermissionAction.REPLACE:
                if not document:
                    raise AppException(status_code=404, code="DOCUMENT_NOT_FOUND", message="Document not found")
                if document.locked_by_request_id != permission_request.id:
                    raise AppException(status_code=409, code="DOC_LOCK_MISMATCH", message="Document lock mismatch")

                payload = permission_request.payload or {}
                pending_file = payload.get("pending_file_url")
                if not pending_file:
                    raise AppException(status_code=400, code="INVALID_PAYLOAD", message="Missing replacement file")

                new_file_url = file_storage.promote_pending_file(pending_file)
                files_to_rollback_on_error.append(new_file_url)
                files_to_delete_after_commit.extend([document.file_url, pending_file])

                document.file_url = new_file_url
                document.version += 1
                document.status = DocumentStatus.ACTIVE
                document.locked_by_request_id = None

            elif permission_request.action == PermissionAction.DELETE:
                if not document:
                    raise AppException(status_code=404, code="DOCUMENT_NOT_FOUND", message="Document not found")
                files_to_delete_after_commit.append(document.file_url)
                self.db.delete(document)
                permission_request.document_id = None

        else:
            raise AppException(status_code=400, code="INVALID_DECISION", message="Invalid review decision")

        self.notification_repo.create(
            user_id=permission_request.requested_by,
            type="PERMISSION_RESULT",
            message=f"Request #{permission_request.id} has been {permission_request.status.value}",
            related_entity_id=permission_request.id,
        )

        try:
            self.db.commit()
            self.db.refresh(permission_request)
        except Exception:
            self.db.rollback()
            for file_path in files_to_rollback_on_error:
                file_storage.delete_if_exists(file_path)
            raise

        for file_path in files_to_delete_after_commit:
            file_storage.delete_if_exists(file_path)

        return {"request": permission_request}
