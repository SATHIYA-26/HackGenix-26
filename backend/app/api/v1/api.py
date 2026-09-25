from fastapi import APIRouter
from backend.app.api.v1 import businesses, youtube

api_router = APIRouter()

api_router.include_router(businesses.router, prefix="/businesses", tags=["Businesses"])
api_router.include_router(youtube.router, prefix="/youtube", tags=["YouTube"])
