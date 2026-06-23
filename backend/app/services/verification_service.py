import asyncio
import httpx
from datetime import datetime, timezone

PROPUBLICA_BASE = "https://projects.propublica.org/nonprofits/api/v2"

# 501(c) subsection codes that represent valid tax-exempt nonprofits
VALID_SUBSECTION_CODES = {3, 4, 5, 6, 7, 8, 10, 13, 19, 23, 25}


async def _query_propublica(ein: str) -> dict:
    """
    Call ProPublica Nonprofit Explorer API.
    Returns one of:
      {"found": True,  "valid": True,  "name": "...", "subsection_code": 3}
      {"found": True,  "valid": False, "subsection_code": 99}
      {"found": False}
      {"error": "<message>"}
    """
    normalized = ein.replace("-", "").replace(" ", "")
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            resp = await client.get(
                f"{PROPUBLICA_BASE}/organizations/{normalized}.json",
                headers={"User-Agent": "CharityHub/1.0 (verification@charityhub.com)"},
            )
        if resp.status_code == 404:
            return {"found": False}
        if resp.status_code != 200:
            return {"error": f"ProPublica API returned HTTP {resp.status_code}"}

        data = resp.json()
        org = data.get("organization", {})
        if not org:
            return {"found": False}

        subsection = org.get("subsection_code") or 0
        return {
            "found": True,
            "valid": int(subsection) in VALID_SUBSECTION_CODES,
            "name": org.get("name", ""),
            "subsection_code": subsection,
            "ntee_code": org.get("ntee_code", ""),
            "city": org.get("city", ""),
            "state": org.get("state", ""),
        }
    except httpx.TimeoutException:
        return {"error": "ProPublica API timed out"}
    except Exception as exc:
        return {"error": str(exc)}


def _insert_manual_review(nonprofit_id: str, review_type: str, metadata: dict, db) -> None:
    db.table("np_manual_reviews").insert({
        "nonprofit_id": nonprofit_id,
        "review_type": review_type,
        "status": "pending",
        "metadata": metadata,
    }).execute()


async def start_ein_verification(nonprofit_id: str, ein: str, np_type: str, db) -> None:
    """
    Full verification pipeline. Called as a FastAPI BackgroundTask.

    Happy path:  submitted → verifying → verified → settlement_setup
    Manual path: submitted → verifying → manual_review  (admin approves → settlement_setup)
    Church path: submitted → verifying → manual_review  (no EIN check)
    """
    # Mark as verifying
    db.table("nonprofits").update({
        "verification_status": "verifying",
        "ein_check_started_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", nonprofit_id).execute()

    # ── Church / religious org path ───────────────────────────────────────
    # EIN check is not applicable — route to manual review for document check
    if np_type in ("church", "religious_org"):
        _insert_manual_review(nonprofit_id, "church_path", {"np_type": np_type}, db)
        db.table("nonprofits").update({"verification_status": "manual_review"}).eq("id", nonprofit_id).execute()
        return

    # ── ProPublica EIN check ──────────────────────────────────────────────
    result = await _query_propublica(ein)

    if "error" in result:
        # API unavailable — queue for manual review rather than blocking the org
        _insert_manual_review(nonprofit_id, "api_error", {"ein": ein, "error": result["error"]}, db)
        db.table("nonprofits").update({"verification_status": "manual_review"}).eq("id", nonprofit_id).execute()
        return

    if not result["found"]:
        # Not in ProPublica — could be a new or very small org, queue for manual check
        _insert_manual_review(nonprofit_id, "ein_not_found", {"ein": ein}, db)
        db.table("nonprofits").update({"verification_status": "manual_review"}).eq("id", nonprofit_id).execute()
        return

    if not result["valid"]:
        # Found but not a recognised tax-exempt type
        _insert_manual_review(nonprofit_id, "invalid_type", {
            "ein": ein,
            "subsection_code": result.get("subsection_code"),
            "name": result.get("name"),
        }, db)
        db.table("nonprofits").update({"verification_status": "manual_review"}).eq("id", nonprofit_id).execute()
        return

    # ── Verified ─────────────────────────────────────────────────────────
    db.table("nonprofits").update({
        "ein_check_passed": True,
        "verification_status": "verified",
        "verified_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", nonprofit_id).execute()

    # Brief pause then advance to settlement_setup so the frontend poll catches it
    await asyncio.sleep(2)
    db.table("nonprofits").update({"verification_status": "settlement_setup"}).eq("id", nonprofit_id).execute()


def get_verification_stages(np: dict) -> list:
    """Returns ordered stage list for the Verification Status screen."""
    status = np.get("verification_status", "submitted")

    if status == "manual_review":
        return [
            {"key": "submitted",     "label": "Submitted",     "description": "Application received successfully",              "status": "complete"},
            {"key": "verifying",     "label": "Verifying",     "description": "EIN lookup completed",                           "status": "complete"},
            {"key": "manual_review", "label": "Under Review",  "description": "Our team is manually reviewing your application. This usually takes 1–2 business days.", "status": "active"},
            {"key": "settlement_setup", "label": "Settlement Setup", "description": "Connect your bank account to receive donations", "status": "pending"},
            {"key": "active",        "label": "Active",         "description": "Your organization is live on Charity Hub",       "status": "pending"},
        ]

    order = ["submitted", "verifying", "verified", "settlement_setup", "active"]
    current_index = order.index(status) if status in order else 0

    stage_meta = [
        ("submitted",     "Submitted",       "Application received successfully"),
        ("verifying",     "Verifying",       "Checking ProPublica & IRS records. Usually takes 2–4 hours."),
        ("verified",      "Verified",        "EIN confirmed with IRS records"),
        ("settlement_setup", "Settlement Setup", "Connect your bank account to receive donations"),
        ("active",        "Active",          "Your organization is live on Charity Hub"),
    ]

    stages = []
    for i, (key, label, description) in enumerate(stage_meta):
        if i < current_index:
            stage_status = "complete"
        elif i == current_index:
            stage_status = "active"
        else:
            stage_status = "pending"
        stages.append({"key": key, "label": label, "description": description, "status": stage_status})

    return stages
