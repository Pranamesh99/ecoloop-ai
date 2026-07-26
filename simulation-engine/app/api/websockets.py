from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
from app.services.simulation import simulation_engine

router = APIRouter()

@router.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await websocket.accept()
    queue = asyncio.Queue(maxsize=100)
    simulation_engine.register_listener(queue)
    
    try:
        # Send current state immediately
        await websocket.send_json(simulation_engine.current_state.model_dump(mode='json'))
        
        while True:
            reading = await queue.get()
            # Send updated state
            await websocket.send_json(reading.model_dump(mode='json'))
    except WebSocketDisconnect:
        simulation_engine.unregister_listener(queue)
    except Exception as e:
        print(f"WS Telemetry Error: {e}")
        simulation_engine.unregister_listener(queue)


# Mock logger queue for AI reasoning
agent_log_listeners = []

@router.websocket("/ws/logs")
async def websocket_logs(websocket: WebSocket):
    await websocket.accept()
    queue = asyncio.Queue(maxsize=100)
    agent_log_listeners.append(queue)
    
    try:
        while True:
            log_msg = await queue.get()
            await websocket.send_json(log_msg)
    except WebSocketDisconnect:
        agent_log_listeners.remove(queue)
    except Exception as e:
        print(f"WS Logs Error: {e}")
        agent_log_listeners.remove(queue)

async def broadcast_agent_log(agent_log_data: dict):
    """
    Called by the MCP server or API when the agent makes a decision
    """
    for q in agent_log_listeners:
        if not q.full():
            await q.put(agent_log_data)
