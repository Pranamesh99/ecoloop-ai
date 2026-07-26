import asyncio
import json
import logging
from tools import read_sensor_data, evaluate_comfort_vs_energy, update_hvac_setpoints, predict_energy
import httpx
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("EcoLoop_Agent")

SYSTEM_PROMPT = """
You are EcoLoop AI, an autonomous building energy optimization agent.
Your goal is to balance occupant comfort with energy efficiency.
You have access to tools to read sensors, evaluate comfort, predict energy, and update HVAC setpoints.

Follow this decision loop (OODA):
1. Observe: Read sensor data.
2. Analyze: Evaluate current comfort and energy usage.
3. Reason: Formulate a strategy.
4. Select ECM: Predict energy for new setpoints.
5. Execute: Update HVAC setpoints.
"""

async def mock_llm_decision_loop():
    logger.info("--- Starting AI Decision Loop ---")
    
    # 1. Observe
    sensors_json = await read_sensor_data(1)
    
    # 2. Analyze
    analysis_json = await evaluate_comfort_vs_energy()
    analysis = json.loads(analysis_json)
    logger.info(f"Comfort Score: {analysis.get('comfort_score_0_to_100')}, Energy: {analysis.get('current_energy_kw')} kW")
    
    # 3. Reason & 4. Select
    current_temp = analysis.get("current_temp", 24.0)
    
    if current_temp < 22.0:
        reasoning = "Temperature dropping below optimal 22.5C threshold. Over-cooling detected. Raising cooling setpoint to 24.5C to conserve energy and lowering ventilation to 1.0 ACH."
        cooling_sp = 24.5
        heating_sp = 20.0
        vent = 1.0
    elif current_temp > 24.0:
        reasoning = "Temperature rising above comfort boundary. PMV score penalizing. Applying dynamic cooling by lowering cooling setpoint to 22.5C."
        cooling_sp = 22.5
        heating_sp = 20.0
        vent = 1.5
    else:
        reasoning = "Thermal equilibrium maintained. Applying night-setback / free cooling drift logic to maximize energy savings."
        cooling_sp = 25.0
        heating_sp = 19.0
        vent = 1.2

    # Predict
    pred_json = await predict_energy(cooling_setpoint=cooling_sp, heating_setpoint=heating_sp)
    
    # 5. Execute
    logger.info(f"Executing Decision: {reasoning}")
    result = await update_hvac_setpoints(cooling_sp, heating_sp, vent, reasoning)
    
    log_payload = {
        "agent": "EcoLoop-AI",
        "reasoning": reasoning,
        "action": f"Set Cooling: {cooling_sp}C, Heating: {heating_sp}C, Vent: {vent}ACH",
        "predicted_kwh": json.loads(pred_json).get("total_kwh_for_window"),
        "status": "Success"
    }
    
    backend_url = os.getenv("BACKEND_URL", "http://127.0.0.1:8000/api/v1")
    async with httpx.AsyncClient() as client:
        try:
            await client.post(f"{backend_url}/logs", json=log_payload)
        except Exception as e:
            logger.error(f"Failed to post log to backend: {e}")

async def run_agent_loop(interval_seconds: int = 15):
    logger.info("Initializing EcoLoop AI Agent Loop...")
    while True:
        try:
            await mock_llm_decision_loop()
        except Exception as e:
            logger.error(f"Agent Loop Error: {e}")
        await asyncio.sleep(interval_seconds)

if __name__ == "__main__":
    asyncio.run(run_agent_loop())
