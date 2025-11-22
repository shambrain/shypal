from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class RegisterReq(BaseModel):
    pubkey: str

@app.post('/devices/register')
async def register(req: RegisterReq):
    return {"device_id": "dev_123", "token": "devtoken"}

@app.post('/friends/upload')
async def upload_friend(payload: dict):
    return {"status": "ok"}

@app.post('/messages/push')
async def push_message(payload: dict):
    return {"status": "enqueued"}

@app.post('/reports')
async def report(payload: dict):
    return {"status": "ok"}
