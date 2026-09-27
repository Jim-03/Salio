from pydantic import BaseModel, Field

from src.dto.transaction_dto import TransactionData


class LastTimestamp(BaseModel):
    timestamp: int | float | None = Field(
        description="The last transaction's timestamp",
        examples=[121546356245, 1215463652.0, None],
    )


class HomeData(BaseModel):
    balance: float = Field(
        description="Account's current balance", examples=[3500, 34_000.00]
    )
    last_5_transactions: list[TransactionData] = Field(
        description="The 5 most recent transactions"
    )
    income: float = Field(
        description="The total income this month", examples=[0.00, 300.00, 30_000]
    )
    expense: float = Field(
        description="The total amount transacted to other accounts this month"
    )
