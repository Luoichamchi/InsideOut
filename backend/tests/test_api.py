import os
import tempfile

os.environ.setdefault("PYTEST_RUNNING", "1")

# Point the app at a throwaway db file before importing it, so tests never
# touch the real finance.db.
_tmp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
import app.db as db_module  # noqa: E402

db_module.DB_PATH = _tmp_db.name

from app.models.schema import init_db  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402

init_db()
client = TestClient(app)


def test_transaction_crud_roundtrip():
    created = client.post(
        "/api/transactions",
        json={"date": "2026-08-01", "type": "side_income", "amount": 500_000, "note": "test"},
    )
    assert created.status_code == 201
    tx_id = created.json()["id"]

    listed = client.get("/api/transactions", params={"month": "2026-08"})
    assert listed.status_code == 200
    assert any(t["id"] == tx_id for t in listed.json())

    updated = client.put(
        f"/api/transactions/{tx_id}",
        json={"date": "2026-08-02", "type": "side_income", "amount": 600_000, "note": "edited"},
    )
    assert updated.status_code == 200
    assert updated.json()["amount"] == 600_000

    deleted = client.delete(f"/api/transactions/{tx_id}")
    assert deleted.status_code == 204

    assert client.delete(f"/api/transactions/{tx_id}").status_code == 404
    assert client.put(
        f"/api/transactions/{tx_id}",
        json={"date": "2026-08-02", "type": "side_income", "amount": 1, "note": None},
    ).status_code == 404


def test_transaction_rejects_invalid_type():
    res = client.post(
        "/api/transactions",
        json={"date": "2026-08-01", "type": "bogus", "amount": 1, "note": None},
    )
    assert res.status_code == 422


def test_config_upsert_is_idempotent_and_updates_in_place():
    first = client.put(
        "/api/config",
        json={
            "month": "2026-09",
            "salary_amount": 12_000_000,
            "side_goal": 6_000_000,
            "budget": 8_000_000,
        },
    )
    assert first.status_code == 200

    second = client.put(
        "/api/config",
        json={
            "month": "2026-09",
            "salary_amount": 13_000_000,
            "side_goal": 6_000_000,
            "budget": 8_000_000,
        },
    )
    assert second.status_code == 200

    fetched = client.get("/api/config/2026-09")
    assert fetched.json()["salary_amount"] == 13_000_000
    assert len(client.get("/api/config").json()) == 1

    assert client.get("/api/config/2099-01").status_code == 404


def test_settings_is_a_single_global_row_not_tied_to_month():
    default = client.get("/api/settings")
    assert default.status_code == 200
    assert default.json()["savings_target"] == 50_000_000

    updated = client.put("/api/settings", json={"savings_target": 60_000_000})
    assert updated.status_code == 200
    assert updated.json()["savings_target"] == 60_000_000

    assert client.get("/api/settings").json()["savings_target"] == 60_000_000
