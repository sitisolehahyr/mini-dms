from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.core.enums import PermissionRequestStatus
from app.models.permission_request import PermissionRequest


class PermissionRequestRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> PermissionRequest:
        permission_request = PermissionRequest(**kwargs)
        self.db.add(permission_request)
        self.db.flush()
        return permission_request

    def get_by_id_for_update(self, request_id: int) -> PermissionRequest | None:
        stmt = select(PermissionRequest).where(PermissionRequest.id == request_id).with_for_update()
        return self.db.scalar(stmt)

    def list_paginated(
        self,
        page: int,
        page_size: int,
        status: PermissionRequestStatus | None,
    ) -> tuple[list[PermissionRequest], int]:
        stmt: Select[tuple[PermissionRequest]] = select(PermissionRequest)

        if status:
            stmt = stmt.where(PermissionRequest.status == status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = int(self.db.scalar(count_stmt) or 0)

        offset = (page - 1) * page_size
        items_stmt = stmt.order_by(PermissionRequest.requested_at.desc()).offset(offset).limit(page_size)
        items = list(self.db.scalars(items_stmt).all())
        return items, total
