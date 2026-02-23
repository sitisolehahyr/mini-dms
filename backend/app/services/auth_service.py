from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.core.security import create_access_token, get_password_hash, verify_password
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest
from app.utils.serializers import serialize_user


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def register(self, payload: RegisterRequest) -> dict:
        existing = self.user_repo.get_by_email(payload.email)
        if existing:
            raise AppException(status_code=409, code="EMAIL_EXISTS", message="Email is already registered")

        user = self.user_repo.create(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=get_password_hash(payload.password),
        )
        self.db.commit()
        self.db.refresh(user)

        token = create_access_token(subject=str(user.id))
        return {"access_token": token, "token_type": "bearer", "user": serialize_user(user)}

    def login(self, payload: LoginRequest) -> dict:
        user = self.user_repo.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise AppException(status_code=401, code="INVALID_CREDENTIALS", message="Invalid email or password")

        token = create_access_token(subject=str(user.id))
        return {"access_token": token, "token_type": "bearer", "user": serialize_user(user)}
