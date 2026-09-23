from pydantic import BaseModel, Field


class LastTimestamp(BaseModel):
    timestamp: int | float | None = Field(
        description="The last transaction's timestamp",
        examples=[121546356245, 1215463652.0, None],
    )
