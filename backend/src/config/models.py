import uuid

from sqlalchemy import Column, Double, Float, ForeignKey, Integer, String, \
  BigInteger
from sqlalchemy.dialects.postgresql import TIMESTAMP, UUID
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Address(Base):
    __tablename__ = "tracked_addresses"
    id = Column(Integer, primary_key=True, autoincrement=True)
    address = Column(String, nullable=False, unique=True)
    description = Column(String)


class TransactionModel(Base):
    __tablename__ = "transactions"
    id = Column(
        UUID(as_uuid=True), default=uuid.uuid4, nullable=False, primary_key=True
    )
    address_id = Column(Integer, ForeignKey("tracked_addresses.id"), nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    amount = Column(Double(precision=2), nullable=False, default=0.00)
    vendor = Column(String)
    recipient = Column(String)
    timestamp = Column(BigInteger, nullable=False)
    balance = Column(Double(precision=2), nullable=False, default=0.00)
    sms = Column(String, nullable=False)
    cost = Column(Double(precision=2), default=0.00, nullable=False)
    action = Column(String)