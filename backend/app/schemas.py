from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = ""

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: str = None
    password: str = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    template_id: str
    title: str
    content: str
    customizations: str = "{}"

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: str = None
    content: str = None
    customizations: str = None

class Document(DocumentBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FavoriteBase(BaseModel):
    template_id: str

class Favorite(FavoriteBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class MessageResponse(BaseModel):
    message: str

class TemplateResponse(BaseModel):
    id: str
    name: str
    description: str
    category: str
    version: str
    customization_fields: list = []
