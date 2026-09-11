from pydantic import BaseModel, Field


class AddressDataDto(BaseModel):
    id: int = Field(description="Unique identifier")
    name: str = Field(
        description="The name of the address", examples=["MPESA", "CO-OP Bank"]
    )
    description: str | None = Field(
        default=None, description="Description of the address"
    )
