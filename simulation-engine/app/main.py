import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import endpoints, websockets
from app.services.simulation import simulation_engine

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router, prefix=settings.API_V1_STR)
app.include_router(websockets.router)

@app.on_event("startup")
async def startup_event():
    # Start high-fidelity simulation loop in background
    asyncio.create_task(simulation_engine.run_loop())

@app.on_event("shutdown")
async def shutdown_event():
    simulation_engine.is_running = False
