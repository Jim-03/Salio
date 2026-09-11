import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()
db_url = os.getenv("DATABASE_URL")
profile = os.getenv("PROFILE") or "dev"

if not db_url:
    os.close(1)
    raise ValueError("Missing Database URL!")

engine = create_engine(db_url, echo=profile.lower() == "dev")

Session = sessionmaker(bind=engine)


def get_db():
    """Retrieve a database session"""
    db = Session()

    try:
        yield db
    finally:
        db.close()
