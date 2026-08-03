import os
import sqlite3
from pathlib import Path

# FINANCE_DB_PATH lets a caller (tests, or the dev-test-server script) point
# at a scratch file instead of the real database — set it before importing
# this module, never edit DB_PATH after the fact.
DB_PATH = Path(os.environ.get("FINANCE_DB_PATH", str(Path(__file__).resolve().parent.parent / "finance.db")))


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn
