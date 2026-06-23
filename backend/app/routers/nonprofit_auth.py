import httpx
from fastapi import APIRouter, HTTPException, status, Depends
from app.database import db, auth_client
from app.middleware.auth import get_current_user
from app.models.nonprofit import NPSignupRequest, NPLoginRequest
from app.config import settings

router = APIRouter(prefix="/np/auth", tags=["NP Auth"])


def _safe_data(result):
    return result.data if result is not None else None


def _session_payload(session) -> dict | None:
    """Return only the scalar fields needed by the frontend."""
    if session is None:
        return None
    return {
        "access_token": getattr(session, "access_token", None),
        "refresh_token": getattr(session, "refresh_token", None),
        "token_type": getattr(session, "token_type", "bearer"),
        "expires_in": getattr(session, "expires_in", None),
    }


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def np_signup(body: NPSignupRequest):
    try:
        auth_response = auth_client.auth.sign_up({"email": body.email, "password": body.password})
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Signup failed — check email/password requirements")

    user_id = str(auth_response.user.id)
    email = str(auth_response.user.email)

    # Auto-confirm email so the user can log in immediately
    try:
        with httpx.Client(timeout=10) as client:
            client.put(
                f"{settings.supabase_url}/auth/v1/admin/users/{user_id}",
                headers={
                    "Authorization": f"Bearer {settings.supabase_service_key}",
                    "apikey": settings.supabase_service_key,
                },
                json={"email_confirm": True},
            )
    except Exception:
        pass

    try:
        np_result = db.table("nonprofits").insert({
            "user_id": user_id,
            "organization_name": body.organization_name,
            "email": email,
            "verification_status": "submitted",
        }).execute()
    except Exception as exc:
        # Clean up the orphaned auth user so the email can be reused
        try:
            with httpx.Client(timeout=10) as client:
                client.delete(
                    f"{settings.supabase_url}/auth/v1/admin/users/{user_id}",
                    headers={
                        "Authorization": f"Bearer {settings.supabase_service_key}",
                        "apikey": settings.supabase_service_key,
                    },
                )
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Database error: {exc}")

    nonprofit = _safe_data(np_result)
    if isinstance(nonprofit, list):
        nonprofit = nonprofit[0] if nonprofit else None

    # Return only plain scalars — avoids gotrue pydantic serialization issues
    return {
        "user": {"id": user_id, "email": email},
        "session": None,
        "nonprofit": nonprofit,
    }


@router.post("/login")
async def np_login(body: NPLoginRequest):
    try:
        auth_response = auth_client.auth.sign_in_with_password({"email": body.email, "password": body.password})
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Login failed: {exc}")

    if not auth_response.user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id = str(auth_response.user.id)
    email = str(auth_response.user.email)

    np = db.table("nonprofits").select("*").eq("user_id", user_id).maybe_single().execute()
    nonprofit = _safe_data(np)

    if not nonprofit:
        raise HTTPException(status_code=404, detail="Nonprofit not found — use /np/auth/signup first")

    return {
        "user": {"id": user_id, "email": email},
        "session": _session_payload(auth_response.session),
        "nonprofit": nonprofit,
    }


@router.get("/me")
async def np_me(user: dict = Depends(get_current_user)):
    user_id = user.get("sub")
    np = db.table("nonprofits").select("*").eq("user_id", user_id).maybe_single().execute()
    return {"user": user, "nonprofit": _safe_data(np)}
