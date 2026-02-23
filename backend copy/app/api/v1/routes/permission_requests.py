from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.core.enums import PermissionRequestStatus, UserRole
from app.core.responses import success_response
from app.models.user import User
from app.schemas.permission_request import ReviewPermissionRequest
from app.services.permission_service import PermissionService
from app.utils.serializers import serialize_permission_request

router = APIRouter()


@router.get("")
def list_permission_requests(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    status: PermissionRequestStatus | None = Query(default=PermissionRequestStatus.PENDING),
    db: Session = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
) -> dict:
    service = PermissionService(db)
    data = service.list_requests(page=page, page_size=page_size, status=status)
    data["items"] = [serialize_permission_request(item) for item in data["items"]]
    data["meta"] = data["meta"].model_dump()
    return success_response(data=data, message="Permission requests fetched")


@router.post("/{request_id}/review")
def review_permission_request(
    request_id: int,
    payload: ReviewPermissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
) -> dict:
    service = PermissionService(db)
    data = service.review_request(
        request_id=request_id,
        admin_user=current_user,
        decision=payload.decision,
        note=payload.note,
    )
    data = {"request": serialize_permission_request(data["request"])}
    return success_response(data=data, message="Request reviewed")
