from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.utils.file_storage import ensure_storage_directories

settings = get_settings()

app = FastAPI(title=settings.app_name)
register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    ensure_storage_directories()


@app.get("/health")
def health_check() -> dict:
    return {"success": True, "message": "Healthy", "data": {"status": "ok"}}


app.include_router(api_router, prefix="/api/v1")
