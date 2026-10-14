from uuid import UUID

from fastapi import APIRouter, Depends

from src.dto.transaction_dto import TransactionData
from src.services.transaction_service import TransactionService

transaction_router = APIRouter(prefix="/transactions", tags=["Transaction"])


@transaction_router.patch(
    "/{id}", status_code=200, description="Update transaction data"
)
def update_transaction(id: UUID, category_id: int, apply_all: bool, service: TransactionService = Depends()):
    """Update existing transaction's details

    Args:
      id: Transaction's unique identifier
      category_id: Category's unique identifier
      apply_all: Condition to update all transactions with a similar vendor & recipient name
      service: Transaction service

    Returns:
      dict[str, str]: An object containing a human-readable message indicating the request was a success
    """
    service.update_transaction(id, category_id, apply_all)

    return {"message": "Successfully updated transaction"}
