from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.schema import init_db
from app.api.routes import transactions, config, settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Finance Dashboard API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    # Single-user LAN app, no cookies/auth involved, so a wildcard is simplest —
    # the frontend can be opened from any device's IP on the network.
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router)
app.include_router(config.router)
app.include_router(settings.router)

if __name__ == "__main__":
    # `uv run python -m app.main` — binds 0.0.0.0 by default so it's reachable
    # from other devices on the LAN without having to remember a --host flag.
    # PORT lets scripts/dev_test_server.sh run on a different port than the
    # real instance, so testing never has to kill whatever's already on 8000.
    import os
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), reload=True)
