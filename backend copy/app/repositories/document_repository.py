from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.core.enums import DocumentStatus
from app.models.document import Document


class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> Document:
        document = Document(**kwargs)
        self.db.add(document)
        self.db.flush()
        return document

    def get_by_id(self, document_id: int) -> Document | None:
        return self.db.get(Document, document_id)

    def get_by_id_for_update(self, document_id: int) -> Document | None:
        stmt = select(Document).where(Document.id == document_id).with_for_update()
        return self.db.scalar(stmt)

    def list_paginated(
        self,
        page: int,
        page_size: int,
        search: str | None,
        status: DocumentStatus | None,
        document_type: str | None,
    ) -> tuple[list[Document], int]:
        stmt: Select[tuple[Document]] = select(Document)

        if search:
            search_pattern = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Document.title.ilike(search_pattern),
                    Document.description.ilike(search_pattern),
                )
            )
        if status:
            stmt = stmt.where(Document.status == status)
        if document_type:
            stmt = stmt.where(Document.document_type.ilike(document_type))

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = int(self.db.scalar(count_stmt) or 0)

        offset = (page - 1) * page_size
        items_stmt = stmt.order_by(Document.created_at.desc()).offset(offset).limit(page_size)
        items = list(self.db.scalars(items_stmt).all())
        return items, total
