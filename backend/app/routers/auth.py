from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import (
    USERS_DB,
    UserRead,
    create_access_token,
    get_current_user,
    verify_password,
)
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    user = USERS_DB.get(data.username)
    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    token = create_access_token({"sub": data.username})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserRead)
async def get_me(user: UserRead = Depends(get_current_user)):
    return user
