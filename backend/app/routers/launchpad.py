from fastapi import APIRouter, HTTPException, Depends
from app.database import db
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/np", tags=["Launchpad"])


def _safe_data(result):
    return result.data if result is not None else None


def _get_np(user_id: str) -> dict:
    result = db.table("nonprofits").select("*").eq("user_id", user_id).maybe_single().execute()
    data = _safe_data(result)
    if not data:
        raise HTTPException(status_code=404, detail="Nonprofit not found")
    return data


@router.get("/launchpad")
async def get_launchpad(user: dict = Depends(get_current_user)):
    user_id = user.get("sub")
    np = _get_np(user_id)
    np_id = np["id"]

    approvals_result = db.table("np_event_approvals").select(
        "id, status, submitted_at, events(title)"
    ).eq("nonprofit_id", np_id).eq("status", "pending").limit(5).execute()

    donations_result = db.table("np_donations").select("*").eq(
        "nonprofit_id", np_id
    ).order("donated_at", desc=True).limit(5).execute()

    engagement_result = db.table("np_engagement_daily").select("*").eq(
        "nonprofit_id", np_id
    ).order("date", desc=True).limit(14).execute()

    activity_result = db.table("np_activity").select("*").eq(
        "nonprofit_id", np_id
    ).order("created_at", desc=True).limit(10).execute()

    engagement = list(reversed(_safe_data(engagement_result) or []))
    payout_date = np.get("next_payout_date")

    return {
        "nonprofit": {
            "id": np_id,
            "org_name": np.get("organization_name", ""),
            "verification_status": np.get("verification_status"),
            "stripe_onboarding_complete": np.get("stripe_onboarding_complete", False),
        },
        "events": {
            "total_active": np.get("total_events_active", 0),
            "total_draft": np.get("total_events_draft", 0),
        },
        "approvals": {
            "pending_count": np.get("pending_approvals_count", 0),
            "recent": _safe_data(approvals_result) or [],
        },
        "donations": _safe_data(donations_result) or [],
        "engagement": engagement,
        "next_payout": {
            "date": str(payout_date) if payout_date else "",
            "amount": float(np.get("next_payout_amount", 0)),
            "status": "Processing",
        },
        "activity": _safe_data(activity_result) or [],
    }


@router.get("/approvals")
async def list_approvals(status: str = None, user: dict = Depends(get_current_user)):
    user_id = user.get("sub")
    np = _get_np(user_id)
    query = db.table("np_event_approvals").select(
        "*, events(title, hero_image_url)"
    ).eq("nonprofit_id", np["id"])
    if status:
        query = query.eq("status", status)
    result = query.order("submitted_at", desc=True).execute()
    return {"approvals": _safe_data(result) or []}


@router.post("/approvals/{approval_id}/approve")
async def approve_event(approval_id: str, user: dict = Depends(get_current_user)):
    user_id = user.get("sub")
    np = _get_np(user_id)

    apr = _safe_data(
        db.table("np_event_approvals").select("*").eq("id", approval_id)
        .eq("nonprofit_id", np["id"]).maybe_single().execute()
    )
    if not apr:
        raise HTTPException(status_code=404, detail="Approval not found")

    db.table("np_event_approvals").update({
        "status": "approved", "reviewed_by": user_id,
    }).eq("id", approval_id).execute()
    db.table("events").update({"status": "live"}).eq("id", apr["event_id"]).execute()
    pending = max(0, (np.get("pending_approvals_count", 1) - 1))
    db.table("nonprofits").update({"pending_approvals_count": pending}).eq("id", np["id"]).execute()

    return {"message": "Event approved"}


@router.post("/approvals/{approval_id}/reject")
async def reject_event(approval_id: str, body: dict, user: dict = Depends(get_current_user)):
    user_id = user.get("sub")
    np = _get_np(user_id)
    reason = body.get("reason", "")

    apr = _safe_data(
        db.table("np_event_approvals").select("*").eq("id", approval_id)
        .eq("nonprofit_id", np["id"]).maybe_single().execute()
    )
    if not apr:
        raise HTTPException(status_code=404, detail="Approval not found")

    db.table("np_event_approvals").update({
        "status": "rejected", "review_note": reason, "reviewed_by": user_id,
    }).eq("id", approval_id).execute()
    db.table("events").update({
        "status": "rejected", "rejection_reason": reason,
    }).eq("id", apr["event_id"]).execute()

    return {"message": "Event rejected"}
