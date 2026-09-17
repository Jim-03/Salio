from pydantic import BaseModel, Field


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
