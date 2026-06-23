from fastapi import Depends, HTTPException, status
from app.middleware.auth import get_current_user
from app.database import db


def require_guardian_consent(user: dict = Depends(get_current_user)) -> dict:
    user_id = user.get("sub")
    result = db.table("se_profiles").select("is_minor,guardian_consent_given").eq("user_id", user_id).maybe_single().execute()
    profile = result.data if result is not None else None
    if profile and profile.get("is_minor") and not profile.get("guardian_consent_given"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Guardian consent required",
        )
    return user
