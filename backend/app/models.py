from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from .database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    template_id = Column(String, index=True)
    title = Column(String)
    content = Column(Text)
    customizations = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    template_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
