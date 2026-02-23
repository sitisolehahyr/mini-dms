from enum import Enum


class UserRole(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class DocumentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PENDING_DELETE = "PENDING_DELETE"
    PENDING_REPLACE = "PENDING_REPLACE"


class PermissionAction(str, Enum):
    REPLACE = "REPLACE"
    DELETE = "DELETE"


class PermissionRequestStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
