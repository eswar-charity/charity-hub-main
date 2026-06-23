from fastapi import APIRouter, HTTPException, Depends, Query
from app.database import db
from app.middleware.auth import get_current_user
from app.models.media import MediaItemCreate
from app.services.cloudinary_service import get_upload_signature, delete_media

router = APIRouter(prefix="/media", tags=["media"])


@router.get("/sign")
async def sign_upload(
    folder: str = Query(...),
    resource_type: str = Query("image"),
    user: dict = Depends(get_current_user),
):
    return get_upload_signature(folder, resource_type)


@router.post("/event/{event_id}", status_code=201)
async def save_media_item(
    event_id: str,
    body: MediaItemCreate,
    user: dict = Depends(get_current_user),
):
    data = body.model_dump()
    data["event_id"] = event_id
    data["uploaded_by"] = user["sub"]
    result = db.table("event_media").insert(data).execute()
    return result.data[0]


@router.delete("/{media_id}", status_code=204)
async def delete_media_item(media_id: str, user: dict = Depends(get_current_user)):
    result = db.table("event_media").select("*").eq("id", media_id).eq("uploaded_by", user["sub"]).maybe_single().execute()
    item = result.data if result is not None else None
    if not item:
        raise HTTPException(status_code=404, detail="Media not found")
    delete_media(item["public_id"], item["media_type"])  # type: ignore[index]
    db.table("event_media").delete().eq("id", media_id).execute()
