from fastapi import APIRouter, HTTPException
from app.schemas.config import MonthlyConfigIn, MonthlyConfigOut
from app.services import config as service

router = APIRouter(prefix="/api/config", tags=["config"])


@router.get("", response_model=list[MonthlyConfigOut])
def list_configs():
    return service.list_configs()


@router.get("/{month}", response_model=MonthlyConfigOut)
def get_config(month: str):
    config = service.get_config(month)
    if config is None:
        raise HTTPException(status_code=404, detail="Config not found for month")
    return config


@router.put("", response_model=MonthlyConfigOut)
def upsert_config(data: MonthlyConfigIn):
    return service.upsert_config(data)
