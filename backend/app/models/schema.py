from app.db import get_connection

CREATE_TRANSACTIONS = """
CREATE TABLE IF NOT EXISTS transactions (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    date    TEXT NOT NULL,
    type    TEXT NOT NULL CHECK (type IN ('side_income', 'expense', 'saving')),
    amount  INTEGER NOT NULL,
    note    TEXT
)
"""

CREATE_MONTHLY_CONFIG = """
CREATE TABLE IF NOT EXISTS monthly_config (
    month           TEXT PRIMARY KEY,
    salary_amount   INTEGER NOT NULL,
    side_goal       INTEGER NOT NULL,
    budget          INTEGER NOT NULL
)
"""

# Single-row table: savings_target isn't tied to a month, so it lives outside
# monthly_config. id is always 1 — there is only ever one settings row.
CREATE_APP_SETTINGS = """
CREATE TABLE IF NOT EXISTS app_settings (
    id              INTEGER PRIMARY KEY CHECK (id = 1),
    savings_target  INTEGER NOT NULL
)
"""

DEFAULT_SAVINGS_TARGET = 50_000_000


def init_db() -> None:
    conn = get_connection()
    try:
        conn.execute(CREATE_TRANSACTIONS)
        conn.execute(CREATE_MONTHLY_CONFIG)
        conn.execute(CREATE_APP_SETTINGS)
        conn.execute(
            "INSERT OR IGNORE INTO app_settings (id, savings_target) VALUES (1, ?)",
            (DEFAULT_SAVINGS_TARGET,),
        )
        conn.commit()
    finally:
        conn.close()
