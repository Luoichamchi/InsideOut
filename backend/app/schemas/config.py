from pydantic import BaseModel


class MonthlyConfigIn(BaseModel):
    month: str  # YYYY-MM
    salary_amount: int
    side_goal: int
    budget: int


class MonthlyConfigOut(BaseModel):
    month: str
    salary_amount: int
    side_goal: int
    budget: int
