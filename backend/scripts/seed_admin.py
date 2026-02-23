from app.core.database import SessionLocal
from app.core.enums import UserRole
from app.core.security import get_password_hash
from app.models.base import Base
from app.models.user import User
from app.core.database import engine


def seed_admin(email: str = "admin@example.com", password: str = "Admin123!", full_name: str = "System Admin") -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"Admin already exists: {email}")
            return

        admin = User(
            email=email,
            full_name=full_name,
            hashed_password=get_password_hash(password),
            role=UserRole.ADMIN,
        )
        db.add(admin)
        db.commit()
        print(f"Seeded admin user: {email} / {password}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
