import re
import httpx
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from app.database import db, auth_client
from app.middleware.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: str
    password: str
    handle: str
    display_name: str
    is_minor: bool = False
    guardian_email: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest):
    auth_response = auth_client.auth.sign_up({"email": body.email, "password": body.password})
    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Signup failed")

    # Auto-confirm email so users can log in immediately without checking inbox.
    # Uses the admin REST API directly — supabase-py admin wrapper requires
    # specific GoTrue config that may not be available on all project tiers.
    try:
        with httpx.Client(timeout=10) as client:
            client.put(
                f"{settings.supabase_url}/auth/v1/admin/users/{auth_response.user.id}",
                headers={
                    "Authorization": f"Bearer {settings.supabase_service_key}",
                    "apikey": settings.supabase_service_key,
                },
                json={"email_confirm": True},
            )
    except Exception:
        pass  # If confirm fails, user can still try to log in or check email

    return {"user": auth_response.user, "session": None}


@router.post("/login")
async def login(body: LoginRequest):
    auth_response = auth_client.auth.sign_in_with_password({"email": body.email, "password": body.password})
    if not auth_response.user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id = auth_response.user.id
    # Create se_profiles on first login (deferred from signup to avoid FK timing issues)
    existing = db.table("se_profiles").select("id").eq("user_id", user_id).maybe_single().execute()
    if not (existing and existing.data):
        email_prefix = body.email.split("@")[0]
        handle = re.sub(r"[^a-z0-9]", "_", email_prefix.lower())[:20] + "_" + str(user_id)[:4]
        db.table("se_profiles").insert({
            "user_id": user_id,
            "handle": handle,
            "display_name": email_prefix,
        }).execute()

    return {"user": auth_response.user, "session": auth_response.session}


@router.post("/logout")
async def logout(user: dict = Depends(get_current_user)):
    auth_client.auth.sign_out()
    return {"message": "Logged out"}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    user_id = user.get("sub")
    profile = db.table("se_profiles").select("*").eq("user_id", user_id).maybe_single().execute()
    se_profile = profile.data if profile is not None else None
    return {"user": user, "se_profile": se_profile}
