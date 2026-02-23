from fastapi import APIRouter

from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.documents import router as documents_router
from app.api.v1.routes.notifications import router as notifications_router
from app.api.v1.routes.permission_requests import router as permission_requests_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(documents_router, prefix="/documents", tags=["documents"])
api_router.include_router(permission_requests_router, prefix="/permission-requests", tags=["permission-requests"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["notifications"])
