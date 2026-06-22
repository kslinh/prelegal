from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class DocumentBase(BaseModel):
    template_id: str
    title: str
    content: str
    customizations: str = "{}"

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    customizations: Optional[str] = None

class Document(DocumentBase):
    id: int
    user_email: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FavoriteBase(BaseModel):
    template_id: str

class Favorite(FavoriteBase):
    id: int
    user_email: str
    created_at: datetime

    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    message: str

class TemplateResponse(BaseModel):
    id: str
    name: str
    description: str
    category: str
    version: str
    customization_fields: list = []
