from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.datastructures import MutableHeaders


class TokenRefreshMiddleware(BaseHTTPMiddleware):
    """
    Middleware az újratöltési tokenek kezelésére.
    """
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        if hasattr(request.state, "new_token"):
            response.headers["X-New-Token"] = request.state.new_token
        
        return response
