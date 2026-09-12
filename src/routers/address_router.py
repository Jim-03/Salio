from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session
from starlette import status
from uvicorn.main import logger

from src.config.database import get_db
from src.config.models import Address
from src.dto.address_dto import AddAddressDto, AddressDataDto

address_router = APIRouter(prefix="/address", tags=["Addresses"])
DatabaseDep: Session = Depends(get_db)


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


@address_router.post(
    "", description="Add new addresses to track", status_code=status.HTTP_204_NO_CONTENT
)
def add_addresses(request: AddAddressDto, db=DatabaseDep):
    """Add new addresses to track

    Args:
        request: request object containing new address data
        db: Database dependency
    """
    try:
        addresses = [{"address": address} for address in request.addresses]

        # Create an insert statement
        stmt = insert(Address).values(addresses)

        # Skip similar addresses
        upsert_stmt = stmt.on_conflict_do_nothing().returning(Address)

        # Persist data
        db.execute(upsert_stmt)

        # Complete transaction
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error("An error has occurred while adding addresses: ", e)
