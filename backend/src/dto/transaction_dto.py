import enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class Metadata(BaseModel):
    code: str = Field(
        description="A 10-character alphanumeric code that uniquely identifiers a transaction",
        examples=["IIOWRWEFDS", "I21H398YDK"],
    )
    amount: float = Field(
        description="The amount being transacted",
        examples=[35.44, 34.56, 100000.00],
    )
    action: str = Field(
        description="The transactional action being done",
        examples=["sent to", "reversed", "paid to", "received from", "debited"],
    )
    vendor: str | None = Field(
        description="The vendor receiving the money. Can be an organization/group",
        examples=["Jamii telecommunications", "Airtel Kenya", "Absa Bank"],
    )
    recipient: str | None = Field(
        description="The account receiving the transaction. Can be a name or Kenyan based phone number",
        examples=["James 0712345678", "254712345678", "Kevin Onyango"],
    )

    time: str = Field(
        description="The time the transaction took in either 24-hr or 12-hr format",
        examples=["12:35 PM", "2230"],
    )
    date: str = Field(
        description="The date when the transaction took place in dd-mm-yyyy format",
        examples=["22/08/2024", "23/08/2002"],
    )
    balance: float | None = Field(
        default=None,
        description="The remaining balance after the transaction",
        examples=[0.00, 343434.50, 10.00],
    )
    cost: float | None = Field(
        default=0.00,
        description="The amount it took to transact the amount",
        examples=[2.00, 3.00, 12.12],
    )


class Transaction(BaseModel):
    text: str = Field(
        description="A transactional text message received after transfering cash to a recipient"
    )
    details: Metadata = Field(description="An object containing the text's features")


class TransactionsList(BaseModel):
    transactions: list[Transaction] = Field(description="A list of transaction objects")


class TransactionData(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID = Field(description="The transaction's unique identifier")
    address_id: int = Field(
        description="The address the transaction belongs to", examples=[1]
    )
    code: str = Field(examples=["OISJIORJTWE"])
    amount: float = Field(
        description="Amount being transacted", examples=[3000.0, 55.00]
    )
    vendor: str | None = Field(
        description="Company owning the recipient's account", examples=["ABSA BANK"]
    )
    recipient: str | None = Field(
        description="The receiver of the money", examples=["User 223", "0712345678"]
    )
    timestamp: int = Field(
        description="The timestamp when the transaction was made",
        examples=[24175687567],
    )
    balance: float = Field(
        description="The remaining balance after transaction",
        examples=[0.00, 300_000.00],
    )
    sms: str = Field(
        description="The actual SMS text",
        examples=[
            "Confirmed you have received Kshs. 2,000.00 from EQUITY BANK. New balance is 20,000.00."
        ],
    )
    cost: float = Field(description="Transaction cost", examples=[0.0, 35.00])
    action: str = Field(
        description="The action being done on the transactions",
        examples=["paid to", "sent to", "reverse", "receive"],
    )


class TransactionDirection(str, enum.Enum):
    ALL = "ALL"
    INCOME = "INCOME"
    SPENT = "SPENT"


class GetTransactionsParams(BaseModel):
    start: int = Field(description="The timestamp of the start of a duration")
    end: int = Field(description="The timestamp of the end of a duration")
    direction: TransactionDirection = Field(
        description="The direction where the transaction is heading based"
    )
    search_term: str | None = Field(
        default=None,
        description="A key word to search in a transaction's vendor/recipient name",
        examples=["John", "Bank"],
    )
    limit: int | None = Field(
        default=10,
        description="The number of transactions to fetch. 1-indexed",
        examples=[10, 15],
    )
    page: int = Field(
        default=0,
        description="The page to fetch from",
        examples=[1, 2, 3],
    )


class GetTransactionsResponse(BaseModel):
    transactions: list[TransactionData] = Field(description="Transaction data")
    page: int = Field(description="Current page")
    number_of_elements: int = Field(
        description="The number of transactions in the current page"
    )
    income: float = Field(
        description="The total earned during the specified period", default=0
    )
    expense: float = Field(
        description="The total expense during the specified period", default=0
    )
