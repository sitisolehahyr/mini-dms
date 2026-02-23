from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.core.enums import UserRole


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


class TokenData(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
