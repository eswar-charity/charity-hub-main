from typing import Optional, Literal
from pydantic import BaseModel


class MediaItemCreate(BaseModel):
    public_id: str
    secure_url: str
    media_type: Literal["image", "video"]
    width: Optional[int] = None
    height: Optional[int] = None
    duration: Optional[float] = None
    format: Optional[str] = None
    display_order: int = 0


class MediaItemResponse(BaseModel):
    id: str
    event_id: str
    public_id: str
    secure_url: str
    media_type: str
    width: Optional[int] = None
    height: Optional[int] = None
    duration: Optional[float] = None
    format: Optional[str] = None
    display_order: int
