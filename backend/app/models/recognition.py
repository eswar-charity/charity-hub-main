from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class RecognitionEventResponse(BaseModel):
    id: str
    se_profile_id: str
    event_type: str
    points_earned: int
    metadata: dict
    created_at: datetime


class TierResponse(BaseModel):
    tier_name: str
    min_points: int
    badge_color: str
    perks: list[str]


class DashboardResponse(BaseModel):
    se_profile: dict
    recent_events: list[dict]
    recognition: dict
    lifetime_stats: dict
    pending_count: int
