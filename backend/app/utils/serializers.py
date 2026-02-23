from app.models.document import Document
from app.models.notification import Notification
from app.models.permission_request import PermissionRequest
from app.models.user import User


def serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role.value,
        "created_at": user.created_at,
    }


def serialize_document(document: Document) -> dict:
    return {
        "id": document.id,
        "title": document.title,
        "description": document.description,
        "document_type": document.document_type,
        "file_url": document.file_url,
        "version": document.version,
        "status": document.status.value,
        "created_by": document.created_by,
        "created_at": document.created_at,
    }


def serialize_permission_request(permission_request: PermissionRequest) -> dict:
    return {
        "id": permission_request.id,
        "document_id": permission_request.document_id,
        "action": permission_request.action.value,
        "requested_by": permission_request.requested_by,
        "requester_email": permission_request.requester_email,
        "requested_at": permission_request.requested_at,
        "status": permission_request.status.value,
        "reviewed_by": permission_request.reviewed_by,
        "reviewed_at": permission_request.reviewed_at,
        "note": permission_request.note,
        "payload": permission_request.payload,
    }


def serialize_notification(notification: Notification) -> dict:
    return {
        "id": notification.id,
        "user_id": notification.user_id,
        "type": notification.type,
        "message": notification.message,
        "related_entity_id": notification.related_entity_id,
        "is_read": notification.is_read,
        "created_at": notification.created_at,
    }
