from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class EventCreate(BaseModel):
    title: str
    description: str
    cause_category: str
    nonprofit_id: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[datetime] = None
    is_private: bool = False
    requires_peer_review: bool = False


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    cause_category: Optional[str] = None
    nonprofit_id: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[datetime] = None
    is_private: Optional[bool] = None
    requires_peer_review: Optional[bool] = None


class EventResponse(BaseModel):
    id: str
    se_profile_id: str
    nonprofit_id: Optional[str] = None
    title: str
    description: str
    cause_category: str
    location: Optional[str] = None
    event_date: Optional[datetime] = None
    status: str
    hero_image_public_id: Optional[str] = None
    hero_image_url: Optional[str] = None
    promo_video_public_id: Optional[str] = None
    promo_video_url: Optional[str] = None
    is_private: bool
    requires_peer_review: bool
    total_donations: float
    total_participants: int
    rejection_reason: Optional[str] = None
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
