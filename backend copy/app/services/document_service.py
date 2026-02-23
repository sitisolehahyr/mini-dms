from math import ceil

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.enums import DocumentStatus, PermissionAction, PermissionRequestStatus, UserRole
from app.core.exceptions import AppException
from app.models.document import Document
from app.models.user import User
from app.repositories.document_repository import DocumentRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.permission_request_repository import PermissionRequestRepository
from app.repositories.user_repository import UserRepository
from app.schemas.common import PaginationMeta
from app.utils.file_storage import file_storage


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.document_repo = DocumentRepository(db)
        self.permission_repo = PermissionRequestRepository(db)
        self.notification_repo = NotificationRepository(db)
        self.user_repo = UserRepository(db)

    def upload_document(
        self,
        current_user: User,
        title: str,
        description: str,
        document_type: str,
        file: UploadFile,
    ) -> Document:
        if not file.filename:
            raise AppException(status_code=400, code="INVALID_FILE", message="A valid file is required")

        stored_path = file_storage.save_upload(file=file, folder="documents")

        try:
            document = self.document_repo.create(
                title=title,
                description=description,
                document_type=document_type,
                file_url=stored_path,
                version=1,
                status=DocumentStatus.ACTIVE,
                created_by=current_user.id,
            )
            self.db.commit()
            self.db.refresh(document)
            return document
        except Exception:
            self.db.rollback()
            file_storage.delete_if_exists(stored_path)
            raise

    def list_documents(
        self,
        page: int,
        page_size: int,
        search: str | None,
        status: DocumentStatus | None,
        document_type: str | None,
    ) -> dict:
        items, total = self.document_repo.list_paginated(
            page=page,
            page_size=page_size,
            search=search,
            status=status,
            document_type=document_type,
        )
        meta = PaginationMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=max(1, ceil(total / page_size)) if total else 1,
        )
        return {"items": items, "meta": meta}

    def get_document(self, document_id: int, _: User) -> Document:
        document = self.document_repo.get_by_id(document_id)
        if not document:
            raise AppException(status_code=404, code="DOCUMENT_NOT_FOUND", message="Document not found")
        return document

    def request_replace(
        self,
        document_id: int,
        current_user: User,
        expected_version: int,
        note: str | None,
        file: UploadFile,
    ) -> dict:
        if not file.filename:
            raise AppException(status_code=400, code="INVALID_FILE", message="Replacement file is required")

        document = self.document_repo.get_by_id_for_update(document_id)
        if not document:
            raise AppException(status_code=404, code="DOCUMENT_NOT_FOUND", message="Document not found")

        if current_user.role != UserRole.ADMIN and document.created_by != current_user.id:
            raise AppException(status_code=403, code="FORBIDDEN", message="Not allowed to request replace for this document")

        if document.status != DocumentStatus.ACTIVE:
            raise AppException(status_code=409, code="DOC_LOCKED", message="Document is not active")

        if document.version != expected_version:
            raise AppException(
                status_code=409,
                code="VERSION_CONFLICT",
                message="Document version conflict. Refresh and retry",
                details={"current_version": document.version},
            )

        pending_file = file_storage.save_upload(file=file, folder="pending")

        try:
            permission_request = self.permission_repo.create(
                document_id=document.id,
                action=PermissionAction.REPLACE,
                requested_by=current_user.id,
                requester_email=current_user.email,
                status=PermissionRequestStatus.PENDING,
                note=note,
                payload={"pending_file_url": pending_file, "original_filename": file.filename},
            )

            document.status = DocumentStatus.PENDING_REPLACE
            document.locked_by_request_id = permission_request.id

            admins = self.user_repo.list_admins()
            if admins:
                self.notification_repo.create_many(
                    payloads=[
                        {
                            "user_id": admin.id,
                            "type": "PERMISSION_REQUEST",
                            "message": f"Replace request #{permission_request.id} needs review",
                            "related_entity_id": permission_request.id,
                        }
                        for admin in admins
                    ]
                )

            self.db.commit()
            self.db.refresh(permission_request)
            return {"request": permission_request, "document": document}
        except Exception:
            self.db.rollback()
            file_storage.delete_if_exists(pending_file)
            raise

    def request_delete(
        self,
        document_id: int,
        current_user: User,
        expected_version: int,
        note: str | None,
    ) -> dict:
        document = self.document_repo.get_by_id_for_update(document_id)
        if not document:
            raise AppException(status_code=404, code="DOCUMENT_NOT_FOUND", message="Document not found")

        if current_user.role != UserRole.ADMIN and document.created_by != current_user.id:
            raise AppException(status_code=403, code="FORBIDDEN", message="Not allowed to request delete for this document")

        if document.status != DocumentStatus.ACTIVE:
            raise AppException(status_code=409, code="DOC_LOCKED", message="Document is not active")

        if document.version != expected_version:
            raise AppException(
                status_code=409,
                code="VERSION_CONFLICT",
                message="Document version conflict. Refresh and retry",
                details={"current_version": document.version},
            )

        permission_request = self.permission_repo.create(
            document_id=document.id,
            action=PermissionAction.DELETE,
            requested_by=current_user.id,
            requester_email=current_user.email,
            status=PermissionRequestStatus.PENDING,
            note=note,
            payload=None,
        )

        document.status = DocumentStatus.PENDING_DELETE
        document.locked_by_request_id = permission_request.id

        admins = self.user_repo.list_admins()
        if admins:
            self.notification_repo.create_many(
                payloads=[
                    {
                        "user_id": admin.id,
                        "type": "PERMISSION_REQUEST",
                        "message": f"Delete request #{permission_request.id} needs review",
                        "related_entity_id": permission_request.id,
                    }
                    for admin in admins
                ]
            )

        self.db.commit()
        self.db.refresh(permission_request)
        return {"request": permission_request, "document": document}
