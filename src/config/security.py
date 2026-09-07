import hmac

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from src.config.settings import Settings


class SecurityMiddleware(BaseHTTPMiddleware):
    PUBLIC_PREFIXES = ("/docs", "/redoc")
    PUBLIC_URL = {"/favicon.ico", "/openapi.json"}

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Check if the path is public
        if self.is_public(request.url.path) or request.method == "OPTIONS":
            return await call_next(request)

        # Extract auth header
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return self.unauthorized()

        # Extract token
        token = auth_header[7:]

        if not token:
            return self.unauthorized()

        # Validate token
        if hmac.compare_digest(token, Settings.AUTH_KEY):
            return await call_next(request)

        return self.unauthorized()

    def is_public(self, path: str) -> bool:
        """Check if the requested path is public

        Args:
          path: Path being requested

        Returns:
            (bool): True if public, False otherwise
        """
        return path in self.PUBLIC_URL or path.startswith(self.PUBLIC_PREFIXES)

    def unauthorized(self) -> Response:
        """Response to unauthorized requests"""
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})
