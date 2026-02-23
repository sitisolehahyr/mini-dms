from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import PermissionAction, PermissionRequestStatus
from app.schemas.common import PaginationMeta


class PermissionRequestResponse(BaseModel):
    id: int
    document_id: int | None
    action: PermissionAction
    requested_by: int
    requester_email: str
    requested_at: datetime
    status: PermissionRequestStatus
    reviewed_by: int | None
    reviewed_at: datetime | None
    note: str | None
    payload: dict | None

    class Config:
        from_attributes = True


class PermissionRequestListResponse(BaseModel):
    items: list[PermissionRequestResponse]
    meta: PaginationMeta


class ReviewPermissionRequest(BaseModel):
    decision: str = Field(pattern="^(APPROVE|REJECT)$")
    note: str | None = Field(default=None, max_length=1000)
