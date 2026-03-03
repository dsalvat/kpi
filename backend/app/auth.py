from datetime import datetime, timedelta, timezone
from hashlib import sha256

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import settings
from app.schemas.auth import UserRead

ALGORITHM = "HS256"

security = HTTPBearer(auto_error=False)


def _hash_password(password: str) -> str:
    """Simple SHA-256 hash for MVP. Replace with bcrypt in production Docker."""
    return sha256(password.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _hash_password(plain_password) == hashed_password


# Hardcoded users for MVP (no SSO per spec)
USERS_DB = {
    "admin": {
        "username": "admin",
        "full_name": "Administrador IT",
        "role": "admin",
        "hashed_password": _hash_password("admin123"),
    },
    "viewer": {
        "username": "viewer",
        "full_name": "Consulta IT",
        "role": "viewer",
        "hashed_password": _hash_password("viewer123"),
    },
}


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> UserRead:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    try:
        payload = decode_token(credentials.credentials)
        username: str = payload.get("sub", "")
        if username not in USERS_DB:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = USERS_DB[username]
    return UserRead(username=user["username"], full_name=user["full_name"], role=user["role"])


async def verify_n8n_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> None:
    if credentials is None or credentials.credentials != settings.N8N_WEBHOOK_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid n8n webhook token",
        )
