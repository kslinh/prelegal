from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
import json

from app.config import settings
from app.database import engine, Base, get_db
from app.models import User, Document, Favorite
from app.schemas import (
    User as UserSchema,
    UserCreate,
    Document as DocumentSchema,
    DocumentCreate,
    DocumentUpdate,
    Favorite as FavoriteSchema,
    FavoriteBase,
    SignInRequest,
    TokenResponse,
    MessageResponse,
)
from app.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_password_hash,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def authenticate_user_func(db: Session, email: str, password: str):
    from app.auth import verify_password
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

@app.post("/auth/signup", response_model=UserSchema)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/signin", response_model=TokenResponse)
def signin(credentials: SignInRequest, db: Session = Depends(get_db)):
    user = authenticate_user_func(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserSchema)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/documents", response_model=list[DocumentSchema])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    documents = db.query(Document).filter(Document.owner_id == current_user.id).all()
    return documents

@app.post("/documents", response_model=DocumentSchema)
def create_document(
    doc: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_doc = Document(
        owner_id=current_user.id,
        template_id=doc.template_id,
        title=doc.title,
        content=doc.content,
        customizations=doc.customizations,
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc

@app.get("/documents/{doc_id}", response_model=DocumentSchema)
def get_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.owner_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@app.put("/documents/{doc_id}", response_model=DocumentSchema)
def update_document(
    doc_id: int,
    doc_update: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.owner_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc_update.title is not None:
        doc.title = doc_update.title
    if doc_update.content is not None:
        doc.content = doc_update.content
    if doc_update.customizations is not None:
        doc.customizations = doc_update.customizations

    db.commit()
    db.refresh(doc)
    return doc

@app.delete("/documents/{doc_id}", response_model=MessageResponse)
def delete_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.owner_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted"}

@app.get("/favorites", response_model=list[FavoriteSchema])
def list_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    favorites = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    return favorites

@app.post("/favorites", response_model=FavoriteSchema)
def add_favorite(
    fav: FavoriteBase,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.template_id == fav.template_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already in favorites")

    new_fav = Favorite(user_id=current_user.id, template_id=fav.template_id)
    db.add(new_fav)
    db.commit()
    db.refresh(new_fav)
    return new_fav

@app.delete("/favorites/{template_id}", response_model=MessageResponse)
def remove_favorite(
    template_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.template_id == template_id,
    ).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")

    db.delete(fav)
    db.commit()
    return {"message": "Favorite removed"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
