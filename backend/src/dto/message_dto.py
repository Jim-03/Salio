import enum

from pydantic import BaseModel


class Address(str, enum.Enum):
    MPESA = "MPESA"


class NewMessageDto(BaseModel):
    address: Address
    messages: list[str]


class AddMessagesDto(BaseModel):
    messages: list[NewMessageDto]
