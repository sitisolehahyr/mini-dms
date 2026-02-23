from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import PaginationMeta


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    message: str
    related_entity_id: int | None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    items: list[NotificationResponse]
    meta: PaginationMeta
