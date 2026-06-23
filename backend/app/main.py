from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, se_profile, events, media, recognition, dashboard
from app.routers import nonprofit_auth, nonprofit_profile, launchpad, admin

app = FastAPI(title="Charity Hub SE API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(se_profile.router)
app.include_router(events.router)
app.include_router(media.router)
app.include_router(recognition.router)
app.include_router(dashboard.router)
app.include_router(nonprofit_auth.router)
app.include_router(nonprofit_profile.router)
app.include_router(launchpad.router)
app.include_router(admin.router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.1"}
