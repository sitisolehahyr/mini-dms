from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.enums import DocumentStatus
from app.core.exceptions import AppException
from app.core.responses import success_response
from app.models.user import User
from app.schemas.document import DeleteRequestPayload
from app.services.document_service import DocumentService
from app.utils.file_storage import file_storage
from app.utils.serializers import serialize_document, serialize_permission_request

router = APIRouter()


@router.post("/upload")
def upload_document(
    title: str = Form(..., min_length=1, max_length=255),
    description: str = Form(..., min_length=1, max_length=5000),
    document_type: str = Form(..., min_length=1, max_length=100),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    service = DocumentService(db)
    document = service.upload_document(
        current_user=current_user,
        title=title,
        description=description,
        document_type=document_type,
        file=file,
    )
    return success_response(data=serialize_document(document), message="Document uploaded")


@router.get("")
def list_documents(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None, min_length=1, max_length=200),
    status: DocumentStatus | None = Query(default=None),
    document_type: str | None = Query(default=None, min_length=1, max_length=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    service = DocumentService(db)
    data = service.list_documents(
        page=page,
        page_size=page_size,
        search=search,
        status=status,
        document_type=document_type,
    )
    data["items"] = [serialize_document(item) for item in data["items"]]
    data["meta"] = data["meta"].model_dump()
    return success_response(data=data, message="Documents fetched")


@router.get("/{document_id}")
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    service = DocumentService(db)
    document = service.get_document(document_id=document_id, _=current_user)
    return success_response(data=serialize_document(document), message="Document fetched")


@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DocumentService(db)
    document = service.get_document(document_id=document_id, _=current_user)

    if current_user.role.value != "ADMIN" and current_user.id != document.created_by:
        raise AppException(status_code=403, code="FORBIDDEN", message="Not allowed to download this file")

    file_path = file_storage.absolute_path(document.file_url)
    if not file_path.exists() or not file_path.is_file():
        raise AppException(status_code=404, code="FILE_NOT_FOUND", message="Stored file not found")

    return FileResponse(path=file_path, filename=file_path.name)


@router.post("/{document_id}/replace-request")
def replace_request(
    document_id: int,
    expected_version: int = Form(..., gt=0),
    note: str | None = Form(default=None, max_length=1000),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    service = DocumentService(db)
    data = service.request_replace(
        document_id=document_id,
        current_user=current_user,
        expected_version=expected_version,
        note=note,
        file=file,
    )
    data = {
        "request": serialize_permission_request(data["request"]),
        "document": serialize_document(data["document"]),
    }
    return success_response(data=data, message="Replace request submitted")


@router.post("/{document_id}/delete-request")
def delete_request(
    document_id: int,
    payload: DeleteRequestPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    service = DocumentService(db)
    data = service.request_delete(
        document_id=document_id,
        current_user=current_user,
        expected_version=payload.expected_version,
        note=payload.note,
    )
    data = {
        "request": serialize_permission_request(data["request"]),
        "document": serialize_document(data["document"]),
    }
    return success_response(data=data, message="Delete request submitted")
