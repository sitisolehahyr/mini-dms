from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.responses import success_response
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.auth_service import AuthService
from app.utils.serializers import serialize_user

router = APIRouter()


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    service = AuthService(db)
    result = service.register(payload)
    return success_response(data=result, message="Registration successful")


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    service = AuthService(db)
    result = service.login(payload)
    return success_response(data=result, message="Login successful")


@router.get("/me")
def me(current_user: User = Depends(get_current_user)) -> dict:
    return success_response(data=serialize_user(current_user), message="Current user")
