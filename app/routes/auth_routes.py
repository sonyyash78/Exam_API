from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.schemas.user_schema import TokenResponse, UserCreate, UserResponse
from app.services.auth_service import login_user, signup_user
from app.utils.jwt_handler import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user account",
    description="Register a new user account with email, name, and password.",
)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    created_user = signup_user(db, user)
    return created_user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate a user",
    description="Authenticate with email and password to receive a JWT access token.",
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    return login_user(db, form_data.username, form_data.password)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
    description="Return the authenticated user's profile data.",
)
def get_me(current_user=Depends(get_current_user)):
    return current_user
