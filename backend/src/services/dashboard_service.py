from fastapi import Depends, HTTPException
from gevent.pool import pass_value
from sqlalchemy import and_, not_
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.config.models import TransactionModel
from src.dto.transaction_dto import (
    GetTransactionsParams,
    TransactionDirection,
)

DatabaseDep: Session = Depends(get_db)


class DashboardService:
    """Business logic handling dashboard data"""

    def __init__(self, db: Session = DatabaseDep):
        self.repository = db

    def get_transactions(self, params: GetTransactionsParams):
        """Retrieve a list of transactions

        Args:
          params: Filters to be applied while retrieving transactions

        Returns:
            (list[TransactionModel]): A list of transactions
        """
        # Check if date range is valid
        if params.start > params.end:
            raise HTTPException(
                status_code=400, detail={"error": "Start date must be before end data!"}
            )

        conditions = [TransactionModel.timestamp.between(params.start, params.end)]

        # Include the search term if provided
        if params.search_term:
            search_term = params.search_term.strip()
            conditions.append(
                (
                    TransactionModel.vendor.icontains(search_term)
                    | TransactionModel.recipient.icontains(search_term)
                )
            )

        # Apply the transactional direction if incoming/spent is specified
        direction_clause = TransactionModel.action.icontains("receive") | (
            TransactionModel.action.icontains("reverse")
            & TransactionModel.sms.contains("credited")
        )
        if params.direction == TransactionDirection.SPENT:
            conditions.append(not_(direction_clause))
        elif params.direction == TransactionDirection.INCOME:
            conditions.append(direction_clause)

        # Build query
        query = (
            self.repository.query(TransactionModel)
            .filter(and_(*conditions))
            .offset(params.page)
        )

        # Apply limit if provided
        if params.limit:
            query = query.limit(params.limit)

        # Run the SQL query
        transactions = query.all()

        return transactions
