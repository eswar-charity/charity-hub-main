from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional
from app.database import db
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])


def _safe_data(result):
    return result.data if result is not None else None


class ReviewDecision(BaseModel):
    note: Optional[str] = None


# ── Manual Review Queue ────────────────────────────────────────────────────────

@router.get("/np-reviews")
async def list_reviews(status: str = "pending", user: dict = Depends(get_current_user)):
    """List manual review items, joined with nonprofit name/email."""
    result = db.table("np_manual_reviews").select(
        "*, nonprofits(id, organization_name, email, ein, np_type, verification_status)"
    ).eq("status", status).order("created_at").execute()
    return {"reviews": _safe_data(result) or []}


@router.post("/np-reviews/{review_id}/approve")
async def approve_review(review_id: str, body: ReviewDecision, user: dict = Depends(get_current_user)):
    """
    Approve a manual review.
    - Marks the review as approved
    - Advances the nonprofit to settlement_setup (ready for Stripe onboarding)
    """
    # Fetch the review
    rev = _safe_data(
        db.table("np_manual_reviews").select("*").eq("id", review_id).maybe_single().execute()
    )
    if not rev:
        raise HTTPException(status_code=404, detail="Review not found")
    if rev["status"] != "pending":
        raise HTTPException(status_code=409, detail=f"Review is already {rev['status']}")

    now = datetime.now(timezone.utc).isoformat()

    # Update review record
    db.table("np_manual_reviews").update({
        "status": "approved",
        "admin_note": body.note,
        "reviewed_at": now,
        "reviewed_by": user.get("sub"),
    }).eq("id", review_id).execute()

    # Advance nonprofit to settlement_setup
    db.table("nonprofits").update({
        "verification_status": "settlement_setup",
        "ein_check_passed": True,
        "verified_at": now,
    }).eq("id", rev["nonprofit_id"]).execute()

    return {"ok": True, "nonprofit_status": "settlement_setup"}


@router.post("/np-reviews/{review_id}/reject")
async def reject_review(review_id: str, body: ReviewDecision, user: dict = Depends(get_current_user)):
    """
    Reject a manual review.
    - Marks the review as rejected
    - Sets nonprofit to rejected with the admin note as rejection_reason
    """
    rev = _safe_data(
        db.table("np_manual_reviews").select("*").eq("id", review_id).maybe_single().execute()
    )
    if not rev:
        raise HTTPException(status_code=404, detail="Review not found")
    if rev["status"] != "pending":
        raise HTTPException(status_code=409, detail=f"Review is already {rev['status']}")

    now = datetime.now(timezone.utc).isoformat()

    db.table("np_manual_reviews").update({
        "status": "rejected",
        "admin_note": body.note,
        "reviewed_at": now,
        "reviewed_by": user.get("sub"),
    }).eq("id", review_id).execute()

    db.table("nonprofits").update({
        "verification_status": "rejected",
        "rejection_reason": body.note or "Application did not meet verification requirements",
    }).eq("id", rev["nonprofit_id"]).execute()

    return {"ok": True, "nonprofit_status": "rejected"}


@router.get("/np-reviews/stats")
async def review_stats(user: dict = Depends(get_current_user)):
    """Summary counts for the admin dashboard."""
    pending = db.table("np_manual_reviews").select("id", count="exact").eq("status", "pending").execute()
    approved = db.table("np_manual_reviews").select("id", count="exact").eq("status", "approved").execute()
    rejected = db.table("np_manual_reviews").select("id", count="exact").eq("status", "rejected").execute()
    return {
        "pending": pending.count or 0,
        "approved": approved.count or 0,
        "rejected": rejected.count or 0,
    }
