from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Address(Base):
    __tablename__ = "tracked_addresses"
    id = Column(Integer, primary_key=True, autoincrement=True)
    address = Column(String, nullable=False, unique=True)
    description = Column(String)
