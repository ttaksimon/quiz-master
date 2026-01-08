from fastapi import WebSocket
from typing import Dict, List


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.game_connections: Dict[str, List[str]] = {}
    
    async def connect(self, websocket: WebSocket, connection_id: str, game_code: str):
        """
        Kapcsolat létrehozása és hozzáadása a menedzserhez
        """
        await websocket.accept()
        self.active_connections[connection_id] = websocket
        
        if game_code not in self.game_connections:
            self.game_connections[game_code] = []
        self.game_connections[game_code].append(connection_id)
    
    def disconnect(self, connection_id: str, game_code: str):
        """
        Kapcsolat bontása és eltávolítása a menedzserből
        """
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        
        if game_code in self.game_connections:
            if connection_id in self.game_connections[game_code]:
                self.game_connections[game_code].remove(connection_id)
            
            if not self.game_connections[game_code]:
                del self.game_connections[game_code]
    
    async def send_personal_message(self, message: dict, connection_id: str):
        """
        Személyes üzenet küldése egy adott kapcsolatnak
        """
        if connection_id in self.active_connections:
            websocket = self.active_connections[connection_id]
            await websocket.send_json(message)
    
    async def broadcast_to_game(self, message: dict, game_code: str):
        """
        Üzenet küldése minden játékosnak egy játékban
        """
        if game_code in self.game_connections:
            for connection_id in self.game_connections[game_code]:
                await self.send_personal_message(message, connection_id)


manager = ConnectionManager()
