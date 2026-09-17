from fastapi import WebSocket


class SocketManager:
    """Service managing websocket connections"""

    def __init__(self):
        self.__clients: list[WebSocket] = []

    def add(self, ws: WebSocket) -> None:
        """Add a new websocket connection to a list of online connections

        Args:
          ws (WebSocket): Client websocket connection
        """
        self.__clients.append(ws)

    async def remove(self, ws: WebSocket) -> None:
        """Removes a disconnected client from the list of maintained connections

        Args:
            ws (WebSocket): Client websocket connection
        """
        for client in self.__clients:
            if client == ws:
                await client.close()


manager = SocketManager()
