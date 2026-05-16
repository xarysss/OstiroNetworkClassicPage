"""
main.py — CodeSourcesGrabber by Ostiro
Lancer : uvicorn main:app --reload --port 8000
"""

import logging, os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router

logging.basicConfig(level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%H:%M:%S")

app = FastAPI(title="CodeSourcesGrabber by Ostiro", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("output", exist_ok=True)

app.include_router(router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok"}
