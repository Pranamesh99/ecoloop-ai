from fastapi import APIRouter
from typing import List
from app.schemas.telemetry import TelemetryReading, HVACSetpoint
from app.services.simulation import simulation_engine
from app.api.websockets import broadcast_agent_log

router = APIRouter()

@router.get("/telemetry/latest", response_model=TelemetryReading)
async def get_latest_telemetry():
    return simulation_engine.current_state

@router.get("/telemetry/history", response_model=List[TelemetryReading])
async def get_telemetry_history():
    return simulation_engine.history

@router.post("/control/setpoints")
async def update_setpoints(setpoints: HVACSetpoint):
    simulation_engine.update_setpoints(setpoints)
    return {"status": "success", "message": "Setpoints updated", "setpoints": setpoints}

@router.post("/simulation/reset")
async def reset_simulation():
    simulation_engine.reset()
    return {"status": "success", "message": "Simulation reset"}

@router.post("/logs")
async def post_agent_log(log_data: dict):
    from app.api.websockets import broadcast_agent_log
    simulation_engine.add_agent_log(log_data)
    await broadcast_agent_log(log_data)
    return {"status": "success"}

@router.get("/logs/history")
async def get_agent_logs():
    return simulation_engine.agent_logs
