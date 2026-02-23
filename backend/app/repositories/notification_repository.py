from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> Notification:
        notification = Notification(**kwargs)
        self.db.add(notification)
        self.db.flush()
        return notification

    def create_many(self, payloads: list[dict]) -> list[Notification]:
        records: list[Notification] = []
        for payload in payloads:
            records.append(self.create(**payload))
        return records

    def list_paginated(self, user_id: int, page: int, page_size: int) -> tuple[list[Notification], int]:
        stmt: Select[tuple[Notification]] = select(Notification).where(Notification.user_id == user_id)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = int(self.db.scalar(count_stmt) or 0)

        offset = (page - 1) * page_size
        items_stmt = stmt.order_by(Notification.created_at.desc()).offset(offset).limit(page_size)
        items = list(self.db.scalars(items_stmt).all())
        return items, total

    def get_for_user(self, notification_id: int, user_id: int) -> Notification | None:
        stmt = select(Notification).where(Notification.id == notification_id, Notification.user_id == user_id)
        return self.db.scalar(stmt)

    def mark_all_read(self, user_id: int) -> int:
        stmt = select(Notification).where(Notification.user_id == user_id, Notification.is_read.is_(False))
        notifications = list(self.db.scalars(stmt).all())
        for notification in notifications:
            notification.is_read = True
        return len(notifications)
