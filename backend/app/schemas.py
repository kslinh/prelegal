from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class SignInResponse(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: int


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
    user_id: int
    user_email: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FavoriteBase(BaseModel):
    template_id: str


class Favorite(FavoriteBase):
    id: int
    user_id: int
    user_email: Optional[str] = None
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


class ChatMessage(BaseModel):
    role: str
    content: str


class DocumentChatRequest(BaseModel):
    messages: list[ChatMessage]
    current_fields: dict[str, str]


class DocumentChatResponse(BaseModel):
    reply: str
    extracted_fields: dict[str, str]
