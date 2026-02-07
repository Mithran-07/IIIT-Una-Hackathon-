"""
Rate Limiting Configuration
Protects API from abuse using slowapi.
"""

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Initialize limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

# Common rate limit decorators
def rate_limit_strict(func):
    """Strict rate limit: 10 requests per minute"""
    return limiter.limit("10/minute")(func)

def rate_limit_moderate(func):
    """Moderate rate limit: 50 requests per minute"""
    return limiter.limit("50/minute")(func)

def rate_limit_relaxed(func):
    """Relaxed rate limit: 100 requests per minute"""
    return limiter.limit("100/minute")(func)
