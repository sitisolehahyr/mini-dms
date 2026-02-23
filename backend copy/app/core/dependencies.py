from collections.abc import Callable

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.enums import UserRole
from app.core.exceptions import AppException
from app.core.security import decode_access_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise AppException(status_code=401, code="INVALID_TOKEN", message="Invalid token") from exc

    user_id = payload.get("sub")
    if not user_id:
        raise AppException(status_code=401, code="INVALID_TOKEN", message="Token payload missing subject")

    try:
        user_id_int = int(user_id)
    except (TypeError, ValueError) as exc:
        raise AppException(status_code=401, code="INVALID_TOKEN", message="Invalid token subject") from exc

    user = db.get(User, user_id_int)
    if not user:
        raise AppException(status_code=401, code="USER_NOT_FOUND", message="Token user no longer exists")

    return user


def require_role(*roles: UserRole) -> Callable:
    def role_dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise AppException(status_code=403, code="FORBIDDEN", message="Not enough permissions")
        return current_user

    return role_dependency
