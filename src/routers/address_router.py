from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.config.models import Address
from src.dto.address_dto import AddressDataDto

address_router = APIRouter(prefix="/address", tags=["Addresses"])
DatabaseDep = Depends(get_db)


@address_router.get(
    "",
    response_model=list[AddressDataDto],
    status_code=200,
    description="Get a list of addresses being tracked",
)
def get_addresses(db: Session = DatabaseDep) -> list[AddressDataDto]:
    """Retrieve a list of addresses being tracked

    Args:
      db (Session): Database dependency

    Returns:
      (list[AddressDataDto]): A list of addresses being tracked

    Raises:
      HttpException: In case there's no tracked address
    """
    result = db.query(Address).all()

    if len(result) == 0:
        raise HTTPException(
            status_code=404, detail={"message": "No addresses being tracked"}
        )

    return [
        AddressDataDto(
            name=address.address, description=address.description, id=address.id
        )
        for address in result
    ]
