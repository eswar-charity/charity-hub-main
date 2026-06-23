import time
import hashlib
import cloudinary
import cloudinary.uploader
from app.config import settings

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
)


def get_upload_signature(folder: str, resource_type: str = "image") -> dict:
    timestamp = int(time.time())
    params_to_sign = f"folder={folder}&timestamp={timestamp}"
    signature = hashlib.sha1(
        f"{params_to_sign}{settings.cloudinary_api_secret}".encode()
    ).hexdigest()
    return {
        "timestamp": timestamp,
        "signature": signature,
        "api_key": settings.cloudinary_api_key,
        "cloud_name": settings.cloudinary_cloud_name,
        "folder": folder,
    }


def delete_media(public_id: str, resource_type: str = "image") -> dict:
    return cloudinary.uploader.destroy(public_id, resource_type=resource_type)
