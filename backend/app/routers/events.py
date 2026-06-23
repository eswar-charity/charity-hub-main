from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Query
from app.database import db
from app.middleware.auth import get_current_user
from app.middleware.minor_protection import require_guardian_consent
from app.models.event import EventCreate, EventUpdate
from app.services.recognition_service import award_points

router = APIRouter(prefix="/events", tags=["events"])


def _safe_data(result) -> dict | None:
    """Return result.data or None — handles maybe_single() returning None when 0 rows."""
    return result.data if result is not None else None


def _get_se_profile(user_id: str) -> dict:
    result = db.table("se_profiles").select("id").eq("user_id", user_id).maybe_single().execute()
    data = _safe_data(result)
    if not data:
        raise HTTPException(status_code=404, detail="SE profile not found — complete profile setup first")
    return data


def _assert_event_owner(event_id: str, se_profile_id: str) -> dict:
    result = db.table("events").select("*").eq("id", event_id).eq("se_profile_id", se_profile_id).maybe_single().execute()
    data = _safe_data(result)
    if not data:
        raise HTTPException(status_code=404, detail="Event not found")
    return data


@router.get("/my")
async def list_my_events(
    status: str | None = Query(None),
    user: dict = Depends(get_current_user),
):
    profile = _get_se_profile(user["sub"])
    query = db.table("events").select("*").eq("se_profile_id", profile["id"]).order("created_at", desc=True)
    if status:
        query = query.eq("status", status)
    return query.execute().data


@router.post("", status_code=201)
async def create_event(
    body: EventCreate,
    user: dict = Depends(require_guardian_consent),
):
    profile = _get_se_profile(user["sub"])
    data = body.model_dump()
    data["se_profile_id"] = profile["id"]
    data["status"] = "draft"
    if data.get("event_date"):
        data["event_date"] = data["event_date"].date().isoformat()
    result = db.table("events").insert(data).execute()
    return result.data[0]


@router.get("/{event_id}")
async def get_event(event_id: str):
    result = db.table("events").select("*").eq("id", event_id).maybe_single().execute()
    data = _safe_data(result)
    if not data:
        raise HTTPException(status_code=404, detail="Event not found")
    return data


@router.put("/{event_id}")
async def update_event(
    event_id: str,
    body: EventUpdate,
    user: dict = Depends(get_current_user),
):
    profile = _get_se_profile(user["sub"])
    _assert_event_owner(event_id, profile["id"])
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    if updates.get("event_date"):
        updates["event_date"] = updates["event_date"].date().isoformat()
    result = db.table("events").update(updates).eq("id", event_id).execute()
    return result.data[0]


@router.delete("/{event_id}", status_code=204)
async def delete_event(event_id: str, user: dict = Depends(get_current_user)):
    profile = _get_se_profile(user["sub"])
    event = _assert_event_owner(event_id, profile["id"])
    if event["status"] != "draft":
        raise HTTPException(status_code=400, detail="Only draft events can be deleted")
    db.table("events").delete().eq("id", event_id).execute()


@router.post("/{event_id}/submit")
async def submit_event(event_id: str, user: dict = Depends(get_current_user)):
    profile = _get_se_profile(user["sub"])
    event = _assert_event_owner(event_id, profile["id"])
    if event["status"] != "draft":
        raise HTTPException(status_code=400, detail="Only draft events can be submitted")
    now = datetime.now(timezone.utc).isoformat()
    db.table("events").update({
        "status": "pending_approval",
        "submitted_at": now,
    }).eq("id", event_id).execute()
    award_points(profile["id"], "event_created", {"event_id": event_id})

    # If the event is linked to a nonprofit, create an approval row and
    # increment the NP's pending_approvals_count so it appears in their queue
    nonprofit_id = event.get("nonprofit_id")
    if nonprofit_id:
        db.table("np_event_approvals").insert({
            "nonprofit_id": nonprofit_id,
            "event_id": event_id,
            "status": "pending",
            "submitted_at": now,
        }).execute()
        np_row = db.table("nonprofits").select("pending_approvals_count").eq(
            "id", nonprofit_id
        ).maybe_single().execute()
        current = (np_row.data or {}).get("pending_approvals_count", 0) if np_row else 0
        db.table("nonprofits").update({
            "pending_approvals_count": current + 1
        }).eq("id", nonprofit_id).execute()

    return {"status": "pending_approval", "nonprofit_id": nonprofit_id}


@router.post("/{event_id}/hero-image")
async def update_hero_image(
    event_id: str,
    public_id: str,
    url: str,
    user: dict = Depends(get_current_user),
):
    profile = _get_se_profile(user["sub"])
    _assert_event_owner(event_id, profile["id"])
    result = db.table("events").update({
        "hero_image_public_id": public_id,
        "hero_image_url": url,
    }).eq("id", event_id).execute()
    return result.data[0]


@router.post("/{event_id}/promo-video")
async def update_promo_video(
    event_id: str,
    public_id: str,
    url: str,
    user: dict = Depends(get_current_user),
):
    profile = _get_se_profile(user["sub"])
    _assert_event_owner(event_id, profile["id"])
    result = db.table("events").update({
        "promo_video_public_id": public_id,
        "promo_video_url": url,
    }).eq("id", event_id).execute()
    return result.data[0]
