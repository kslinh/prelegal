from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status, Request, Query
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session

from app.config import settings
from app.schemas import TokenData


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    # JWT requires "sub" to be a string
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def verify_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            return None
        user_id = int(user_id_str)
        return TokenData(user_id=user_id)
    except (JWTError, ValueError, TypeError):
        return None


async def get_current_user(request: Request) -> int:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        scheme, token = auth_header.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_data = verify_token(token)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token_data.user_id


async def get_current_user_optional(request: Request) -> Optional[int]:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None

    try:
        scheme, token = auth_header.split()
        if scheme.lower() != "bearer":
            return None
    except ValueError:
        return None

    token_data = verify_token(token)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token_data.user_id


async def resolve_user_id(
    request: Request,
    email: Optional[str] = Query(None),
    db: Session = Depends(lambda: None),
) -> int:
    current_user_id = await get_current_user_optional(request)
    if current_user_id:
        return current_user_id

    if email:
        from app.models import User
        from app.database import SessionLocal
        if db is None:
            db = SessionLocal()
        try:
            user = db.query(User).filter(User.email == email).first()
            if user:
                return user.id
        finally:
            db.close()

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required"
    )
