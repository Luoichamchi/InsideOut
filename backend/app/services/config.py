from typing import Optional
from app.db import get_connection
from app.schemas.config import MonthlyConfigIn


def get_config(month: str) -> Optional[dict]:
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM monthly_config WHERE month = ?", (month,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def list_configs() -> list[dict]:
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM monthly_config ORDER BY month").fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def upsert_config(data: MonthlyConfigIn) -> dict:
    conn = get_connection()
    try:
        conn.execute(
            """
            INSERT INTO monthly_config (month, salary_amount, side_goal, budget)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(month) DO UPDATE SET
                salary_amount = excluded.salary_amount,
                side_goal = excluded.side_goal,
                budget = excluded.budget
            """,
            (data.month, data.salary_amount, data.side_goal, data.budget),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM monthly_config WHERE month = ?", (data.month,)).fetchone()
        return dict(row)
    finally:
        conn.close()
