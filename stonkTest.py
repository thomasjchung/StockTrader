import asyncio, websockets, json

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

asyncio.run(listen())

