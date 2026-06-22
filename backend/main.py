from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine, Base, get_db
from app.models import Document, Favorite
from app.schemas import (
    Document as DocumentSchema,
    DocumentCreate,
    DocumentUpdate,
    Favorite as FavoriteSchema,
    FavoriteBase,
    MessageResponse,
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

@app.get("/documents", response_model=list[DocumentSchema])
def list_documents(
    email: str = Query(...),
    db: Session = Depends(get_db),
):
    documents = db.query(Document).filter(Document.user_email == email).all()
    return documents

@app.post("/documents", response_model=DocumentSchema)
def create_document(
    doc: DocumentCreate,
    email: str = Query(...),
    db: Session = Depends(get_db),
):
    new_doc = Document(
        user_email=email,
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
    email: str = Query(...),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_email == email,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@app.put("/documents/{doc_id}", response_model=DocumentSchema)
def update_document(
    doc_id: int,
    doc_update: DocumentUpdate,
    email: str = Query(...),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_email == email,
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
    email: str = Query(...),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_email == email,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted"}

@app.get("/favorites", response_model=list[FavoriteSchema])
def list_favorites(
    email: str = Query(...),
    db: Session = Depends(get_db),
):
    favorites = db.query(Favorite).filter(Favorite.user_email == email).all()
    return favorites

@app.post("/favorites", response_model=FavoriteSchema)
def add_favorite(
    fav: FavoriteBase,
    email: str = Query(...),
    db: Session = Depends(get_db),
):
    existing = db.query(Favorite).filter(
        Favorite.user_email == email,
        Favorite.template_id == fav.template_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already in favorites")

    new_fav = Favorite(user_email=email, template_id=fav.template_id)
    db.add(new_fav)
    db.commit()
    db.refresh(new_fav)
    return new_fav

@app.delete("/favorites/{template_id}", response_model=MessageResponse)
def remove_favorite(
    template_id: str,
    email: str = Query(...),
    db: Session = Depends(get_db),
):
    fav = db.query(Favorite).filter(
        Favorite.user_email == email,
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
