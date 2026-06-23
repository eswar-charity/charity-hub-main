from fastapi import APIRouter, Depends
from app.database import db
from app.middleware.auth import get_current_user
from app.services.recognition_service import get_se_points, TIER_THRESHOLDS

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/se")
async def se_dashboard(user: dict = Depends(get_current_user)):
    user_id = user["sub"]

    profile_result = db.table("se_profiles").select("*").eq("user_id", user_id).maybe_single().execute()
    profile = profile_result.data if profile_result is not None else None
    if not profile:
        return {}

    profile_id = profile["id"]

    recent_events = db.table("events") \
        .select("id,title,status,created_at,total_donations,total_participants") \
        .eq("se_profile_id", profile_id) \
        .order("created_at", desc=True) \
        .limit(5) \
        .execute().data

    pending_count = db.table("events") \
        .select("id", count="exact") \
        .eq("se_profile_id", profile_id) \
        .eq("status", "pending_approval") \
        .execute().count or 0

    total_points = get_se_points(profile_id)
    tiers = sorted(TIER_THRESHOLDS.items(), key=lambda x: x[1])
    next_tier = next((name for name, pts in tiers if pts > total_points), None)
    next_pts = TIER_THRESHOLDS.get(next_tier) if next_tier else None

    recent_recognition = db.table("recognition_events") \
        .select("*") \
        .eq("se_profile_id", profile_id) \
        .order("created_at", desc=True) \
        .limit(5) \
        .execute().data

    return {
        "se_profile": profile,
        "recent_events": recent_events,
        "recognition": {
            "tier": profile["recognition_tier"],
            "total_points": total_points,
            "next_tier": next_tier,
            "points_to_next_tier": (next_pts - total_points) if next_pts else 0,
            "recent_events": recent_recognition,
        },
        "lifetime_stats": {
            "total_events_created": profile["total_events_created"],
            "total_donations_raised": float(profile["total_donations_raised"]),
            "total_participants": profile["total_participants"],
        },
        "pending_count": pending_count,
    }
