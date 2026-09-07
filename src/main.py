from dotenv import load_dotenv
from fastapi import FastAPI

from src.config.security import SecurityMiddleware

# Instantiate FastAPI app
app = FastAPI()

# Load .env variables
load_dotenv()

# Security
app.add_middleware(SecurityMiddleware)
