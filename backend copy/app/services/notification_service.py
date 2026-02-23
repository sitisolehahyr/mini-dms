from math import ceil

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.user import User
from app.repositories.notification_repository import NotificationRepository
from app.schemas.common import PaginationMeta


class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.notification_repo = NotificationRepository(db)

    def list_notifications(self, current_user: User, page: int, page_size: int) -> dict:
        items, total = self.notification_repo.list_paginated(
            user_id=current_user.id,
            page=page,
            page_size=page_size,
        )
        meta = PaginationMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=max(1, ceil(total / page_size)) if total else 1,
        )
        return {"items": items, "meta": meta}

    def mark_read(self, current_user: User, notification_id: int) -> None:
        notification = self.notification_repo.get_for_user(notification_id=notification_id, user_id=current_user.id)
        if not notification:
            raise AppException(status_code=404, code="NOTIFICATION_NOT_FOUND", message="Notification not found")
        notification.is_read = True
        self.db.commit()

    def mark_all_read(self, current_user: User) -> int:
        count = self.notification_repo.mark_all_read(user_id=current_user.id)
        self.db.commit()
        return count
