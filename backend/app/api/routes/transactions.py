from typing import Optional
from fastapi import APIRouter, HTTPException
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionOut,
    MonthSummary,
    LastSideIncomeDate,
)
from app.services import transactions as service

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionOut])
def list_transactions(month: Optional[str] = None):
    return service.list_transactions(month)


@router.get("/monthly-summary", response_model=list[MonthSummary])
def monthly_summary():
    return service.monthly_summary()


@router.get("/last-side-income-date", response_model=LastSideIncomeDate)
def last_side_income_date(before: str):
    return {"date": service.last_side_income_date(before)}


@router.post("", response_model=TransactionOut, status_code=201)
def create_transaction(data: TransactionCreate):
    return service.create_transaction(data)


@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(transaction_id: int, data: TransactionUpdate):
    updated = service.update_transaction(transaction_id, data)
    if updated is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return updated


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int):
    if not service.delete_transaction(transaction_id):
        raise HTTPException(status_code=404, detail="Transaction not found")
