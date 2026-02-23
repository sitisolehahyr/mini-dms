from datetime import UTC, datetime
from typing import Any

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import PermissionAction, PermissionRequestStatus
from app.models.base import Base


class PermissionRequest(Base):
    __tablename__ = "permission_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    document_id: Mapped[int | None] = mapped_column(ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    action: Mapped[PermissionAction] = mapped_column(Enum(PermissionAction, name="permission_action"), nullable=False)
    requested_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    status: Mapped[PermissionRequestStatus] = mapped_column(
        Enum(PermissionRequestStatus, name="permission_status"),
        nullable=False,
        default=PermissionRequestStatus.PENDING,
        index=True,
    )
    reviewed_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    payload: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    requester_email: Mapped[str] = mapped_column(String(255), nullable=False)
