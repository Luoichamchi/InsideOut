from fastapi import APIRouter
from app.schemas.settings import AppSettingsIn, AppSettingsOut
from app.services import settings as service

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=AppSettingsOut)
def get_settings():
    return service.get_settings()


@router.put("", response_model=AppSettingsOut)
def update_settings(data: AppSettingsIn):
    return service.update_settings(data)
