from app.db import get_connection
from app.schemas.settings import AppSettingsIn


def get_settings() -> dict:
    conn = get_connection()
    try:
        row = conn.execute("SELECT savings_target FROM app_settings WHERE id = 1").fetchone()
        return dict(row)
    finally:
        conn.close()


def update_settings(data: AppSettingsIn) -> dict:
    conn = get_connection()
    try:
        conn.execute(
            "UPDATE app_settings SET savings_target = ? WHERE id = 1",
            (data.savings_target,),
        )
        conn.commit()
        row = conn.execute("SELECT savings_target FROM app_settings WHERE id = 1").fetchone()
        return dict(row)
    finally:
        conn.close()
