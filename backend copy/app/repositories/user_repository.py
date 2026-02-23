from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.enums import UserRole
from app.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        return self.db.scalar(stmt)

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def create(self, email: str, full_name: str, hashed_password: str, role: UserRole = UserRole.USER) -> User:
        user = User(email=email, full_name=full_name, hashed_password=hashed_password, role=role)
        self.db.add(user)
        self.db.flush()
        return user

    def list_admins(self) -> list[User]:
        stmt = select(User).where(User.role == UserRole.ADMIN)
        return list(self.db.scalars(stmt).all())
