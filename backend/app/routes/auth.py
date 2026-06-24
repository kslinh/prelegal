from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, User as UserSchema, SignInRequest, SignInResponse
from app.auth import hash_password, verify_password, create_access_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=SignInResponse)
def signup(user_create: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_create.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_password = hash_password(user_create.password)
    new_user = User(
        email=user_create.email,
        password_hash=hashed_password,
        full_name=user_create.full_name,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Auto-sign in the user after signup
    access_token_expires = timedelta(days=settings.remember_me_expire_days)
    access_token = create_access_token(
        data={"sub": new_user.id},
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }


@router.post("/signin", response_model=SignInResponse)
def signin(signin_request: SignInRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == signin_request.email).first()

    if not user or not verify_password(signin_request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if signin_request.remember_me:
        access_token_expires = timedelta(days=settings.remember_me_expire_days)
    else:
        access_token_expires = timedelta(hours=settings.access_token_expire_hours)

    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
