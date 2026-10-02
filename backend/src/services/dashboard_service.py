from fastapi import Depends, HTTPException
from gevent.pool import pass_value
from sqlalchemy import and_, case, func, not_
from sqlalchemy.orm import Session
from sqlalchemy.sql.functions import coalesce

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
        self.income_clause = TransactionModel.action.icontains("receive") | (
            TransactionModel.action.icontains("reverse")
            & TransactionModel.sms.contains("credited")
        )

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
        if params.direction == TransactionDirection.SPENT:
            conditions.append(not_(self.income_clause))
        elif params.direction == TransactionDirection.INCOME:
            conditions.append(self.income_clause)

        # Build query
        query = (
            self.repository.query(TransactionModel)
            .filter(and_(*conditions))
            .order_by(TransactionModel.timestamp.desc())
            .offset(params.page * params.limit)
        )

        # Apply limit if provided
        if params.limit:
            query = query.limit(params.limit)

        # Run the SQL query
        transactions = query.all()

        return transactions

    def get_totals(self, start: int, end: int) -> tuple[float, float]:
        """Get the total income and expense within a specified period
        Args:
          start: The timestamp starting the period
          end: The timestamp ending the period
        Returns:
            (tuple[float, float]): A tuple containing the income and expense of the specified period
        """
        total_income_calc = func.sum(
            case((self.income_clause, TransactionModel.amount), else_=0)
        ).label("income")

        total_expense_calc = func.sum(
            case((not_(self.income_clause), TransactionModel.amount), else_=0)
        ).label("expense")

        total_cost_calc = func.sum(
            case((not_(self.income_clause), TransactionModel.cost), else_=0)
        ).label("cost")

        row = (
            self.repository.query(
                total_income_calc, total_expense_calc, total_cost_calc
            )
            .filter(TransactionModel.timestamp.between(start, end))
            .first()
        )
        income = row.income if row.income else 0
        expense = row.expense if row.expense else 0
        cost = row.cost if row.cost else 0

        return income, expense + cost

    def get_summary(self) -> list[TransactionModel]:
        """Retrieve a list of the last 5 transactions"""

        return (
            self.repository.query(TransactionModel)
            .order_by(TransactionModel.timestamp.desc())
            .limit(5)
            .all()
        )
