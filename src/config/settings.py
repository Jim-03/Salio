import enum
import os


class Settings(str, enum.Enum):
    """System-wide details"""

    AUTH_KEY = os.getenv("AUTHENTICATION_KEY")
