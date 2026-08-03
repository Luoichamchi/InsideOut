from typing import Optional
from app.db import get_connection
from app.schemas.transaction import TransactionCreate, TransactionUpdate


def list_transactions(month: Optional[str] = None) -> list[dict]:
    conn = get_connection()
    try:
        if month:
            rows = conn.execute(
                "SELECT * FROM transactions WHERE date LIKE ? ORDER BY date, id",
                (f"{month}-%",),
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM transactions ORDER BY date, id").fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def create_transaction(data: TransactionCreate) -> dict:
    conn = get_connection()
    try:
        cur = conn.execute(
            "INSERT INTO transactions (date, type, amount, note) VALUES (?, ?, ?, ?)",
            (data.date, data.type, data.amount, data.note),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM transactions WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row)
    finally:
        conn.close()


def update_transaction(transaction_id: int, data: TransactionUpdate) -> Optional[dict]:
    conn = get_connection()
    try:
        cur = conn.execute(
            "UPDATE transactions SET date = ?, type = ?, amount = ?, note = ? WHERE id = ?",
            (data.date, data.type, data.amount, data.note, transaction_id),
        )
        conn.commit()
        if cur.rowcount == 0:
            return None
        row = conn.execute("SELECT * FROM transactions WHERE id = ?", (transaction_id,)).fetchone()
        return dict(row)
    finally:
        conn.close()


def delete_transaction(transaction_id: int) -> bool:
    conn = get_connection()
    try:
        cur = conn.execute("DELETE FROM transactions WHERE id = ?", (transaction_id,))
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()
