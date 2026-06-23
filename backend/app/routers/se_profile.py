from fastapi import APIRouter, HTTPException, Depends
from app.database import db
from app.middleware.auth import get_current_user
from app.models.se import SEProfileUpdate

router = APIRouter(prefix="/se", tags=["se_profile"])


def _safe_data(result) -> dict | None:
    return result.data if result is not None else None


def _get_profile_for_user(user_id: str) -> dict:
    result = db.table("se_profiles").select("*").eq("user_id", user_id).maybe_single().execute()
    data = _safe_data(result)
    if not data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return data


@router.get("/profile")
async def get_own_profile(user: dict = Depends(get_current_user)):
    return _get_profile_for_user(user["sub"])


@router.put("/profile")
async def update_profile(body: SEProfileUpdate, user: dict = Depends(get_current_user)):
    profile = _get_profile_for_user(user["sub"])
    updates = body.model_dump(exclude_none=True)
    if not updates:
        return profile
    result = db.table("se_profiles").update(updates).eq("id", profile["id"]).execute()
    return result.data[0]


@router.post("/profile/avatar")
async def update_avatar(
    public_id: str,
    url: str,
    user: dict = Depends(get_current_user),
):
    profile = _get_profile_for_user(user["sub"])
    result = db.table("se_profiles").update({
        "avatar_public_id": public_id,
        "avatar_url": url,
    }).eq("id", profile["id"]).execute()
    return result.data[0]


@router.get("/profile/{handle}")
async def get_public_profile(handle: str):
    result = db.table("se_profiles").select("*").eq("handle", handle).maybe_single().execute()
    data = _safe_data(result)
    if not data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return data
