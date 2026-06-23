from pydantic import BaseModel
from typing import Optional


class NPSignupRequest(BaseModel):
    organization_name: str
    email: str
    password: str


class NPLoginRequest(BaseModel):
    email: str
    password: str


class NPOrgDetailsRequest(BaseModel):
    ein: str
    legal_name: str
    registered_address: str
    official_contact_email: str
    website: Optional[str] = None
    np_type: str = "standard"


class NPVerificationStatusResponse(BaseModel):
    verification_status: str
    ein_check_passed: bool
    ein_check_started_at: Optional[str] = None
    verified_at: Optional[str] = None
    rejection_reason: Optional[str] = None
    stripe_onboarding_complete: bool
    stages: list
