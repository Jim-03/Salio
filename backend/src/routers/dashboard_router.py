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
def get_home(db: Session = DatabaseDep) -> HomeData:
    """Retrieve data to be displayed in the home tab

    Args:
      db(Session): Database dependency

    Returns:
      (HomeData): An object containing the home tab data
    """

    today = datetime.now()
    start_of_month = int(datetime(today.year, today.month, 1).timestamp() * 1000)
    end_time = int(today.timestamp() * 1000)

    q_last_5_transaction = (
        db.query(TransactionModel).order_by(TransactionModel.timestamp.desc()).limit(5)
    )

    q_monthly_transactions = db.query(TransactionModel).filter(
        TransactionModel.timestamp.between(start_of_month, end_time)
    )

    all_transactions = (
        q_last_5_transaction.union(q_monthly_transactions)
        .order_by(TransactionModel.timestamp.desc())
        .all()
    )

    last_5_transactions = all_transactions[:5]
    last_transaction = all_transactions[0] if all_transactions else None

    income = 0
    expense = float(last_transaction.balance - all_transactions[-1].balance or 0)

    for tx in all_transactions:
        if tx.timestamp >= start_of_month and (
            ("receive" in tx.action) or ("reverse" in tx.action and "credit" in tx.sms)
        ):
            income = income + tx.amount

    return HomeData(
        balance=last_transaction.balance or 0,
        income=income,
        expense=expense,
        last_5_transactions=[
            TransactionData(
                id=tx.id,
                address_id=tx.address_id,
                code=tx.code,
                amount=tx.amount,
                vendor=tx.vendor,
                recipient=tx.recipient,
                timestamp=tx.timestamp,
                balance=tx.balance,
                sms=tx.sms,
                cost=tx.cost,
                action=tx.action,
            )
            for tx in last_5_transactions
        ],
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

    return GetTransactionsResponse(
        transactions=transactions,
        number_of_elements=len(transactions),
        page=params.page,
    )
