import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket
from starlette.websockets import WebSocketDisconnect
from uvicorn.main import logger

from src.config.security import SecurityMiddleware
from src.services.socket_manager import manager

# Instantiate FastAPI app
app = FastAPI()

# Load .env variables
load_dotenv()

# Security
app.add_middleware(SecurityMiddleware)


# Websocket
@app.websocket("/ws")
async def websocket(ws: WebSocket):
    """Handler for websocket communication

    Args:
      ws (WebSocket): Client websocket connection
    """
    # Accept connection with client
    await ws.accept()

    # Save client connection to a managed list
    manager.add(ws)

    try:
        # Trigger event loop to keep connection alive
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        # Remove disconnected client from managed list
        await manager.remove(ws)
        logger.warn("Client disconnected")


if __name__ == "__main__":
    uvicorn.run(app="main:app", host="0.0.0.0", port=8000, reload=True)
