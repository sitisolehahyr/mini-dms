import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import get_settings

settings = get_settings()


class FileStorageService:
    def __init__(self) -> None:
        self.root = Path(settings.storage_dir)
        self.documents_dir = self.root / "documents"
        self.pending_dir = self.root / "pending"

    def ensure_directories(self) -> None:
        self.documents_dir.mkdir(parents=True, exist_ok=True)
        self.pending_dir.mkdir(parents=True, exist_ok=True)

    def _build_relative_path(self, folder: str, original_name: str) -> str:
        extension = Path(original_name).suffix
        safe_name = f"{uuid4().hex}{extension}"
        return f"{folder}/{safe_name}"

    def save_upload(self, file: UploadFile, folder: str) -> str:
        self.ensure_directories()
        relative_path = self._build_relative_path(folder, file.filename or "document.bin")
        absolute_path = self.root / relative_path
        absolute_path.parent.mkdir(parents=True, exist_ok=True)

        with absolute_path.open("wb") as target:
            shutil.copyfileobj(file.file, target)

        return relative_path

    def absolute_path(self, relative_path: str) -> Path:
        normalized = Path(relative_path)
        resolved = (self.root / normalized).resolve()
        if self.root.resolve() not in resolved.parents and resolved != self.root.resolve():
            raise ValueError("Invalid file path")
        return resolved

    def delete_if_exists(self, relative_path: str | None) -> None:
        if not relative_path:
            return
        try:
            target = self.absolute_path(relative_path)
        except ValueError:
            return
        if target.exists() and target.is_file():
            target.unlink()

    def promote_pending_file(self, pending_relative_path: str) -> str:
        self.ensure_directories()
        pending_abs = self.absolute_path(pending_relative_path)
        extension = pending_abs.suffix
        new_relative = f"documents/{uuid4().hex}{extension}"
        new_abs = self.absolute_path(new_relative)
        new_abs.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(pending_abs, new_abs)
        return new_relative


file_storage = FileStorageService()


def ensure_storage_directories() -> None:
    file_storage.ensure_directories()
