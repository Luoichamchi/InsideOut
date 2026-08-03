from typing import Literal, Optional
from pydantic import BaseModel

TransactionType = Literal["side_income", "expense", "saving"]


class TransactionCreate(BaseModel):
    date: str  # YYYY-MM-DD
    type: TransactionType
    amount: int
    note: Optional[str] = None


class TransactionUpdate(BaseModel):
    date: str
    type: TransactionType
    amount: int
    note: Optional[str] = None


class TransactionOut(BaseModel):
    id: int
    date: str
    type: TransactionType
    amount: int
    note: Optional[str] = None


class MonthSummary(BaseModel):
    month: str  # YYYY-MM
    side_income: int
    expense: int
    saving: int


class LastSideIncomeDate(BaseModel):
    date: Optional[str] = None  # YYYY-MM-DD
