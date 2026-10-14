from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import update
from sqlalchemy.orm import Session

from src.config.database import DatabaseDep
from src.config.models import CategoryModel, TransactionModel


class TransactionService:
    def __init__(self, db: Session = DatabaseDep) -> None:
        self.__repository = db

    def update_transaction(self, tx_id: UUID, category_id: int, apply_all: bool):
        """Update transaction data

        Args:
          tx_id: Transaction's unique identifier
          category_id: Category's unique identifier
          apply_all: Update transactions with similar vendor & recipient name
        """
        # Edge case
        if tx_id is None:
            raise HTTPException(status_code=400, detail="Transaction id is required")

        if category_id is None:
            raise HTTPException(status_code=400, detail="Category id is required")

        try:
            # Fetch transaction and category data
            tx = (
                self.__repository.query(TransactionModel)
                .filter(TransactionModel.id == tx_id)
                .first()
            )

            if tx is None:
                raise HTTPException(status_code=404, detail="Transaction not found")

            category = (
                self.__repository.query(CategoryModel)
                .filter(CategoryModel.id == category_id)
                .first()
            )

            if category is None:
                raise HTTPException(status_code=404, detail="Category doesn't exist")

            # Persist
            if apply_all:
                self.__repository.execute(
                    update(TransactionModel)
                    .where(
                        TransactionModel.recipient == tx.recipient,
                        TransactionModel.vendor == tx.vendor,
                    )
                    .values({"category_id": category.id})
                )
            else:
                tx.category_id = category.id

            self.__repository.commit()
        except Exception:
            self.__repository.rollback()
            raise
