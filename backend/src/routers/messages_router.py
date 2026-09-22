from fastapi import APIRouter, Depends

from src.dto.message_dto import AddMessagesDto, Address
from src.services.mpesa import Mpesa

message_router = APIRouter(prefix="/messages")
MpesaDep = Depends(Mpesa)


@message_router.post("")
async def add_messages(request: AddMessagesDto, mpesa_service: Mpesa = MpesaDep):
    for message in request.messages:
        if message.address == Address.MPESA:
            mpesa_service.add(message.messages)
