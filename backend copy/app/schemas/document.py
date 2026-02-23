from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import DocumentStatus
from app.schemas.common import PaginationMeta


class DocumentResponse(BaseModel):
    id: int
    title: str
    description: str
    document_type: str
    file_url: str
    version: int
    status: DocumentStatus
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    items: list[DocumentResponse]
    meta: PaginationMeta


class DeleteRequestPayload(BaseModel):
    expected_version: int = Field(gt=0)
    note: str | None = Field(default=None, max_length=1000)
