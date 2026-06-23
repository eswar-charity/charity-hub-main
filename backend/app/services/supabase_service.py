from app.database import db


def get_se_profile_by_user_id(user_id: str) -> dict | None:
    result = db.table("se_profiles").select("*").eq("user_id", user_id).maybe_single().execute()
    return result.data


def get_se_profile_by_id(profile_id: str) -> dict | None:
    result = db.table("se_profiles").select("*").eq("id", profile_id).maybe_single().execute()
    return result.data
