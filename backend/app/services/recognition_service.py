from app.database import db

POINTS_MAP = {
    "event_created": 50,
    "event_live": 100,
    "donation_received": 10,
    "participant_joined": 5,
    "peer_review_given": 25,
}

TIER_THRESHOLDS = {
    "Spark": 0,
    "Flame": 500,
    "Torch": 2000,
    "Beacon": 5000,
    "Legend": 15000,
}


def _calculate_tier(points: int) -> str:
    tier = "Spark"
    for name, threshold in TIER_THRESHOLDS.items():
        if points >= threshold:
            tier = name
    return tier


def get_se_points(se_profile_id: str) -> int:
    result = db.table("recognition_events") \
        .select("points_earned") \
        .eq("se_profile_id", se_profile_id) \
        .execute()
    return sum(r["points_earned"] for r in (result.data or []))


def award_points(se_profile_id: str, event_type: str, metadata: dict = None) -> dict:
    points = POINTS_MAP.get(event_type, 0)
    db.table("recognition_events").insert({
        "se_profile_id": se_profile_id,
        "event_type": event_type,
        "points_earned": points,
        "metadata": metadata or {},
    }).execute()

    total_points = get_se_points(se_profile_id)
    new_tier = _calculate_tier(total_points)
    db.table("se_profiles").update({
        "recognition_tier": new_tier,
    }).eq("id", se_profile_id).execute()

    return {"points_earned": points, "total_points": total_points, "tier": new_tier}
