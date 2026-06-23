# import stripe  # TODO: uncomment for live Stripe integration
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Request  # noqa: F401 (Request used in live Stripe block)
from app.database import db
from app.middleware.auth import get_current_user
from app.models.nonprofit import NPOrgDetailsRequest
from app.services.verification_service import start_ein_verification, get_verification_stages
from app.config import settings

router = APIRouter(prefix="/np", tags=["NP Profile"])


def _safe_data(result):
    return result.data if result is not None else None


def _get_np(user_id: str) -> dict:
    result = db.table("nonprofits").select("*").eq("user_id", user_id).maybe_single().execute()
    data = _safe_data(result)
    if not data:
        raise HTTPException(status_code=404, detail="Nonprofit not found")
    return data


# ── Public directory (no auth required) ──────────────────────────────────────

@router.get("/directory")
async def list_active_nonprofits():
    """Public list of active nonprofits for SE event linking."""
    result = db.table("nonprofits").select(
        "id, organization_name, ein, website"
    ).eq("verification_status", "active").order("organization_name").execute()
    return {"nonprofits": result.data or []}


# ── Org details + EIN verification ───────────────────────────────────────────

@router.post("/org-details")
async def submit_org_details(
    body: NPOrgDetailsRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
):
    user_id = user.get("sub")
    np = _get_np(user_id)

    result = db.table("nonprofits").update({
        "ein": body.ein,
        "legal_name": body.legal_name,
        "registered_address": body.registered_address,
        "official_contact_email": body.official_contact_email,
        "website": body.website,
        "np_type": body.np_type,
    }).eq("id", np["id"]).execute()

    updated = _safe_data(result)
    if isinstance(updated, list):
        updated = updated[0] if updated else None

    # Pass np_type so church path skips EIN check
    background_tasks.add_task(
        start_ein_verification, np["id"], body.ein, body.np_type, db
    )

    return {"nonprofit": updated}


# ── Verification status ───────────────────────────────────────────────────────

@router.get("/verification-status")
async def get_verification_status(user: dict = Depends(get_current_user)):
    user_id = user.get("sub")
    np = _get_np(user_id)
    stages = get_verification_stages(np)
    return {
        "verification_status": np.get("verification_status"),
        "ein_check_passed": np.get("ein_check_passed", False),
        "ein_check_started_at": np.get("ein_check_started_at"),
        "verified_at": np.get("verified_at"),
        "rejection_reason": np.get("rejection_reason"),
        "stripe_onboarding_complete": np.get("stripe_onboarding_complete", False),
        "stages": stages,
    }


# ── Stripe Connect (MOCK — swap with live block below for production) ─────────

@router.post("/stripe-connect")
async def setup_stripe_connect(user: dict = Depends(get_current_user)):
    """
    MOCK: simulates Stripe onboarding by immediately marking the nonprofit
    as stripe_onboarding_complete=True and advancing status to 'active'.
    Replace this entire function with the live block below for production.
    """
    user_id = user.get("sub")
    np = _get_np(user_id)
    db.table("nonprofits").update({
        "stripe_onboarding_complete": True,
        "verification_status": "active",
    }).eq("id", np["id"]).execute()
    base_url = settings.cors_origins.split(",")[0].strip()
    return {"onboarding_url": f"{base_url}/np/verification?stripe=complete"}


@router.get("/stripe-connect/status")
async def get_stripe_status(user: dict = Depends(get_current_user)):
    user_id = user.get("sub")
    np = _get_np(user_id)
    return {"stripe_onboarding_complete": np.get("stripe_onboarding_complete", False)}


# ── TODO: Live Stripe Connect (uncomment + delete mock above when ready) ──────
#
# @router.post("/stripe-connect")
# async def setup_stripe_connect(user: dict = Depends(get_current_user)):
#     if not settings.stripe_secret_key:
#         raise HTTPException(status_code=503, detail="Stripe not configured")
#     stripe.api_key = settings.stripe_secret_key
#     user_id = user.get("sub")
#     np = _get_np(user_id)
#     account_id = np.get("stripe_account_id")
#     if not account_id:
#         account = stripe.Account.create(
#             type="express",
#             email=np.get("official_contact_email") or np.get("email"),
#             business_type="non_profit",
#             capabilities={"transfers": {"requested": True}},
#             business_profile={"name": np.get("organization_name")},
#         )
#         account_id = account.id
#         db.table("nonprofits").update({"stripe_account_id": account_id}).eq("id", np["id"]).execute()
#     base_url = settings.cors_origins.split(",")[0].strip()
#     account_link = stripe.AccountLink.create(
#         account=account_id,
#         refresh_url=f"{base_url}/np/verification",
#         return_url=f"{base_url}/np/verification?stripe=complete",
#         type="account_onboarding",
#     )
#     return {"onboarding_url": account_link.url}
#
# @router.post("/stripe-connect/webhook")
# async def stripe_webhook(request: Request):
#     if not settings.stripe_webhook_secret:
#         raise HTTPException(status_code=503, detail="Stripe webhook not configured")
#     payload = await request.body()
#     sig_header = request.headers.get("stripe-signature", "")
#     try:
#         event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
#     except stripe.error.SignatureVerificationError:
#         raise HTTPException(status_code=400, detail="Invalid Stripe signature")
#     if event["type"] == "account.updated":
#         account = event["data"]["object"]
#         if account.get("charges_enabled"):
#             result = db.table("nonprofits").select("id").eq("stripe_account_id", account["id"]).maybe_single().execute()
#             np_row = _safe_data(result)
#             if np_row:
#                 db.table("nonprofits").update({
#                     "stripe_onboarding_complete": True,
#                     "verification_status": "active",
#                 }).eq("id", np_row["id"]).execute()
#     return {"received": True}
