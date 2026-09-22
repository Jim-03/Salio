import re
from datetime import datetime
from typing import Any

from fastapi import Depends, HTTPException
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session
from starlette import status
from uvicorn.main import logger

from src.config.database import get_db
from src.config.models import Address, TransactionModel

code_pattern = r"\b(?=[0-9]*[A-Z])(?=[A-Z]*[0-9])[A-Z0-9]{10}\b"
amount_pattern = r"confirmed\.*\s*(?:you have received|you bought|.*?[ap]mwithdraw|.*?m give|.*?and)?\sksh([\d,]+\.\d{1,2})\s(?:is credited)?"
recipient_pattern = (
    r"(?:paid to|sent to|[\d,]+\.\d{1,2} (from|of)| cash to) (.*?) (?:new|on)"
)
date_pattern = r"on (\d{1,2}/\d{1,2}/\d{2,4})"
time_pattern = r"on \d{1,2}/\d{1,2}/\d{2,4} at (\d{1,2}:\d{1,2} (PM|AM))"
cost_pattern = r"transaction cost, ksh([\d,]+\.\d{1,2})"
balance_pattern = r"balance is ksh([\d,]+\.\d{1,2})"
action_pattern = r"(?:received|sent to|withdraw|paid to|bought|give ksh|reverse)"


class Mpesa:
    def __init__(self, db: Session = Depends(get_db)):
        self.__repository = db

    def parse(self, txt: str, address_id: int) -> dict[str, Any]:
        """Convert sms text to transaction object

        Args:
          txt(str): Raw SMS text from SMS message
          address_id(int): Inbox address unique identifier

        Returns:
          (dict[str, Any]): Transaction object

        Raise:
          ValueError: For failed transaction and texts not having financial information
        """
        # Remove double-spacing
        msg = re.sub(r"\s+", " ", txt)

        # Extract financial details
        code_match = re.findall(code_pattern, msg)
        amount_match = re.search(amount_pattern, msg, re.IGNORECASE)
        recipient_match = re.search(recipient_pattern, msg, re.IGNORECASE)
        date_match = re.search(date_pattern, msg, re.IGNORECASE)
        time_match = re.search(time_pattern, msg, re.IGNORECASE)
        cost_match = re.search(cost_pattern, msg, re.IGNORECASE)
        balance_match = re.search(balance_pattern, msg, re.IGNORECASE)
        action = re.search(action_pattern, msg, re.IGNORECASE)

        if (
            None in [amount_match, balance_match, date_match, time_match]
            or not code_match
        ):
            raise ValueError(msg)

        vendor = None
        recipient = None

        day_str, month_str, year_str = date_match.group(1).split("/")

        year = int(year_str)
        if year < 100:
            year += 2000

        dt = datetime.strptime(time_match.group(1), "%I:%M %p")
        timestamp = datetime(
            year, int(month_str), int(day_str), hour=dt.hour, minute=dt.minute
        ).timestamp()

        if recipient_match:
            if len(recipient_match.group(2).split("for account")) == 2:
                vendor, recipient = recipient_match.group(2).split("for account")
            else:
                recipient = recipient_match.group(2)

        amount_str = amount_match.group(1).replace(",", "")
        balance_str = balance_match.group(1).replace(",", "")

        cost_str = "0"

        if cost_match:
            cost_str = cost_match.group(1).replace(",", "")

        data = {
            "code": code_match[0],
            "amount": float(amount_str),
            "vendor": vendor and vendor.upper(),
            "recipient": recipient and recipient.upper(),
            "timestamp": float(timestamp),
            "balance": float(balance_str),
            "address_id": address_id,
            "sms": msg,
            "cost": float(cost_str),
            "action": action.group(0),
        }
        return data

    def add(self, messages: list[str]):
        """Add new transactions from messages
        Args:
          messages(list[str]): A list of raw text SMS messages

        Return:
          (dict[str, str): Confirmatory response object
        """
        # Skip missing/empty lists
        if messages is None or len(messages) == 0:
            return {"message": "No messages to process"}

        unprocessable: list[str] = []

        # Convert to transaction object
        data = []
        try:
            # Fetch the inbox address details
            address = (
                self.__repository.query(Address)
                .filter(Address.address == "MPESA")
                .one()
            )

            # Process each message
            for msg in messages:
                try:
                    transaction = self.parse(msg, address.id)
                    data.append(transaction)
                except ValueError:
                    unprocessable.append(msg)

            # Prepare insert statement
            stmt = insert(TransactionModel).values(data)

            # Skip in case of conflict
            conflict = stmt.on_conflict_do_nothing()

            # Persist to storage
            self.__repository.execute(conflict)
            self.__repository.commit()

            return {
                "message": "Successfully added messages",
            }

        except Exception as e:
            self.__repository.rollback()
            logger.warning(e)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"error": "Failed to add messages"},
            )
