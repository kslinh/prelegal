from datetime import datetime
from pydantic import BaseModel, EmailStr

class DocumentBase(BaseModel):
    template_id: str
    title: str
    content: str
    customizations: str = "{}"

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    customizations: str | None = None

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
