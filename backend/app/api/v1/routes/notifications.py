from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.responses import success_response
from app.models.user import User
from app.services.notification_service import NotificationService
from app.utils.serializers import serialize_notification

router = APIRouter()


@router.get("")
def list_notifications(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    service = NotificationService(db)
    data = service.list_notifications(current_user=current_user, page=page, page_size=page_size)
    data["items"] = [serialize_notification(item) for item in data["items"]]
    data["meta"] = data["meta"].model_dump()
    return success_response(data=data, message="Notifications fetched")


@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    service = NotificationService(db)
    service.mark_read(current_user=current_user, notification_id=notification_id)
    return success_response(data=None, message="Notification marked as read")


@router.patch("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    service = NotificationService(db)
    count = service.mark_all_read(current_user=current_user)
    return success_response(data={"updated": count}, message="All notifications marked as read")
