from pydantic import BaseModel, Field


class AddressDataDto(BaseModel):
    id: int = Field(description="Unique identifier")
    name: str = Field(
        description="The name of the address", examples=["MPESA", "CO-OP Bank"]
    )
    description: str | None = Field(
        default=None, description="Description of the address"
    )


class AddAddressDto(BaseModel):
    addresses: set[str] = Field(
        description="A list of inbox addresses that will be checked for financial SMS messages",
        examples=[{"MPESA", "DTB", "John"}],
    )
