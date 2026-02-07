from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from dotenv import load_dotenv
import os
from datetime import timedelta

load_dotenv()

from app.api.analyze import router as analyze_router
from app.api.upload_regulation import router as upload_router
from app.api.chat import router as chat_router
from app.api.history_endpoint import router as history_router
from app.api.report import router as report_router

# Import auth and rate limiting
from app.api.auth import (
    authenticate_user, 
    create_access_token, 
    Token, 
    ACCESS_TOKEN_EXPIRE_MINUTES,
    UserCreate,
    register_new_user,
    User,
    get_current_active_user
)
from app.api.rate_limit import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

app = FastAPI(
    title="AuditX Backend",
    description="Privacy-First AI Financial Audit System with Enterprise Security",
    version="2.0.0"
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Secure CORS configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Whitelist instead of "*"
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Restrict to needed methods
    allow_headers=["Authorization", "Content-Type"],  # Explicit headers
)

# Include routers
app.include_router(analyze_router, prefix="/api", tags=["Analysis"])
app.include_router(upload_router, prefix="/api", tags=["Regulations"])
app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(history_router, prefix="/api", tags=["History"])
app.include_router(report_router, prefix="/api", tags=["Reporting"])

# Authentication endpoint
@app.post("/api/token", response_model=Token, tags=["Authentication"])
@limiter.limit("5/minute")  # Strict rate limit on login
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible token login endpoint.
    
    Default credentials (CHANGE IN PRODUCTION):
    - Username: admin
    - Password: secret
    """
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/register", response_model=Token, tags=["Authentication"])
@limiter.limit("5/minute")
async def register(request: Request, user: UserCreate):
    """
    Register a new user.
    """
    new_user = register_new_user(user)
    
    # Auto-login after registration
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/me", response_model=User, tags=["Authentication"])
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Get current user profile.
    """
    return current_user

@app.get("/")
@limiter.limit("100/minute")
async def root(request: Request):
    return {
        "message": "AuditX Backend v2.0 - Enterprise Edition",
        "features": ["JWT Auth", "Rate Limiting", "Chain-of-Thought AI", "Ethereum Provenance"],
        "privacy": "ACTIVE - Zero data retention"
    }

@app.get("/health")
@limiter.limit("200/minute")
async def health_check(request: Request):
    return {"status": "ok", "version": "2.0.0"}
