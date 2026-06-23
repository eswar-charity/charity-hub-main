from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class SEProfileCreate(BaseModel):
    handle: str
    display_name: str
    bio: Optional[str] = None
    cause_categories: list[str] = []
    is_minor: bool = False
    guardian_email: Optional[str] = None


class SEProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    cause_categories: Optional[list[str]] = None
    guardian_email: Optional[str] = None
    guardian_consent_given: Optional[bool] = None


class SEProfileResponse(BaseModel):
    id: str
    user_id: str
    handle: str
    display_name: str
    bio: Optional[str] = None
    cause_categories: list[str] = []
    is_minor: bool
    guardian_email: Optional[str] = None
    guardian_consent_given: bool
    avatar_public_id: Optional[str] = None
    avatar_url: Optional[str] = None
    recognition_tier: str
    total_events_created: int
    total_donations_raised: float
    total_participants: int
    created_at: datetime
    updated_at: datetime
