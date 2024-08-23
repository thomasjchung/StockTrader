import asyncio, websockets, json

API_KEY = "PKJQ31Z7457AD5YWJGBD"
API_SECRET = "MFayRl2Nr2q92GQfAnxskuxzYYZKnMcB4ZhNmm4F"
FRONTEND_WEBSOCKET_PORT = 6789

clients = set()

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
            print(data)
            await notify_clients(data)

async def notify_clients(data):
    if clients:
        message = json.dumps(data)
        await asyncio.gather(*[client.send(message) for client in clients])

async def frontend_handler(websocket, path):
    clients.add(websocket)
    try:
        async for message in websocket:
            pass
    finally:
        clients.remove(websocket)

async def main():
    alpaca_task = asyncio.create_task(listen())
    server_task = websockets.serve(frontend_handler, "localhost", FRONTEND_WEBSOCKET_PORT)
    await asyncio.gather(alpaca_task, server_task)

asyncio.run(main())

