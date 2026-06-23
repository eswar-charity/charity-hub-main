from fastapi import APIRouter, Depends
from app.database import db
from app.middleware.auth import get_current_user
from app.services.recognition_service import get_se_points, TIER_THRESHOLDS

router = APIRouter(prefix="/recognition", tags=["recognition"])


def _get_profile_id(user_id: str):
    result = db.table("se_profiles").select("id,recognition_tier").eq("user_id", user_id).maybe_single().execute()
    data = result.data if result is not None else None
    if not data:
        return None, None
    return data["id"], data["recognition_tier"]


@router.get("/tiers")
async def list_tiers():
    result = db.table("recognition_tiers").select("*").order("min_points").execute()
    return result.data


@router.get("/my")
async def my_recognition(user: dict = Depends(get_current_user)):
    profile_id, tier = _get_profile_id(user["sub"])
    if not profile_id:
        return {}
    total_points = get_se_points(profile_id)
    tiers = sorted(TIER_THRESHOLDS.items(), key=lambda x: x[1])
    next_tier = next((name for name, pts in tiers if pts > total_points), None)
    next_pts = TIER_THRESHOLDS.get(next_tier) if next_tier else None
    recent = db.table("recognition_events") \
        .select("*") \
        .eq("se_profile_id", profile_id) \
        .order("created_at", desc=True) \
        .limit(10) \
        .execute()
    return {
        "tier": tier,
        "total_points": total_points,
        "next_tier": next_tier,
        "points_to_next_tier": (next_pts - total_points) if next_pts else 0,
        "recent_events": recent.data,
    }


@router.get("/my/stats")
async def my_stats(user: dict = Depends(get_current_user)):
    result = db.table("se_profiles") \
        .select("total_events_created,total_donations_raised,total_participants,recognition_tier") \
        .eq("user_id", user["sub"]) \
        .maybe_single() \
        .execute()
    return (result.data if result is not None else None) or {}
