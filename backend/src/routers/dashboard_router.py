from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uvicorn.main import logger

from src.config.database import get_db
from src.config.models import TransactionModel
from src.dto.dashboard_dto import HomeData, LastTimestamp
from src.dto.transaction_dto import (
    GetTransactionsParams,
    GetTransactionsResponse,
    TransactionData,
)
from src.services.dashboard_service import DashboardService

dashboard_router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

DatabaseDep = Depends(get_db)


@dashboard_router.get(
    "/last-import", description="Get the last transaction's timestamp"
)
def get_last_import(db: Session = DatabaseDep) -> LastTimestamp:
    """Retrieve the last transaction's timestamp

    Args:
      db(Session): Database connection dependency

    Return:
      (LastTimestamp): Object containing the last transaction's timestamp
    """
    try:
        last_transaction = (
            db.query(TransactionModel)
            .order_by(TransactionModel.timestamp.desc())
            .first()
        )

        return LastTimestamp(
            timestamp=last_transaction.timestamp if last_transaction else None
        )
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500,
            detail={"error": "Server failed to fetch last transaction timestamp"},
        )


@dashboard_router.get(
    "/home",
    description="Retrieve details displayed on the home tab",
    name="Get home data",
)
def get_home(service: DashboardService = Depends()) -> HomeData:
    """Retrieve data to be displayed in the home tab

    Args:
      service(DashboardService): Service dependency

    Returns:
      (HomeData): An object containing the home tab data
    """
    # Get current month's boundaries
    today = datetime.now()
    start_of_month = int(datetime(today.year, today.month, 1).timestamp() * 1000)
    end_time = int(today.timestamp() * 1000)

    # Fetch last 5 transactions
    last_5_transactions = service.get_summary()
    last_transaction = last_5_transactions[0] if last_5_transactions else None

    # Calculate income and expense for current month
    income, expense = service.get_totals(start_of_month, end_time)

    return HomeData(
        balance=last_transaction.balance or 0,
        income=income,
        expense=expense,
        last_5_transactions=last_5_transactions,
    )


@dashboard_router.get(
    "/transactions",
    response_model=GetTransactionsResponse,
    description="Retrieve a list of all transactions given filters",
)
def get_transactions(
    params: GetTransactionsParams = Depends(), service: DashboardService = Depends()
):
    transactions = service.get_transactions(params)
    income, expense = service.get_totals(params.start, params.end)

    return GetTransactionsResponse(
        transactions=transactions,
        number_of_elements=len(transactions),
        page=params.page,
        income=float(income),
        expense=float(expense),
    )
