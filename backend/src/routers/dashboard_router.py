from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uvicorn.main import logger

from src.config.database import get_db
from src.config.models import TransactionModel
from src.dto.dashboard_dto import LastTimestamp

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
