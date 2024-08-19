from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import asyncio, websockets, json, threading


app = Flask(__name__)
#CORS(app)
socketio = SocketIO(app)

API_KEY = "PKJQ31Z7457AD5YWJGBD"
API_SECRET = "MFayRl2Nr2q92GQfAnxskuxzYYZKnMcB4ZhNmm4F"

async def listen():
    url = "wss://stream.data.alpaca.markets/v2/test"
    headers = {
        'APCA-API-KEY-ID': API_KEY,
        'APCA-API-SECRET-KEY': API_SECRET
    }
    async with websockets.connect(url, extra_headers = headers) as websocket:
        subscribe_message = json.dumps({
            "action": "subscribe",
            "bars": ["FAKEPACA"]
        })
        await websocket.send(subscribe_message)

        while True:
            response = await websocket.recv()
            data = json.loads(response)
            
            socketio.emit('data_update', data)

def start_websocket():
    asyncio.run(listen())

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    # Start the WebSocket listener in a separate thread
    websocket_thread = threading.Thread(target=start_websocket)
    websocket_thread.start()
    socketio.run(app)