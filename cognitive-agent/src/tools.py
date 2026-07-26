import httpx
import os
from pydantic import BaseModel
import json

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000/api/v1")

async def read_sensor_data(history_minutes: int = 15) -> str:
    """Reads current and historical sensor telemetry data."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BACKEND_URL}/telemetry/history")
            response.raise_for_status()
            data = response.json()
            # Fetch last N minutes (assuming 1 data point per second for our mock, that's history_minutes * 60)
            data_points = history_minutes * 60
            return json.dumps(data[-data_points:], indent=2)
        except Exception as e:
            return json.dumps({"error": f"Failed to fetch sensor data: {str(e)}"})

async def evaluate_comfort_vs_energy() -> str:
    """Calculates the current PMV comfort score and estimates energy penalty."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BACKEND_URL}/telemetry/latest")
            response.raise_for_status()
            data = response.json()
            
            temp = data.get("zone_temp_c", 23.0)
            co2 = data.get("zone_co2_ppm", 400.0)
            chiller_load = data.get("chiller_load_kw", 0.0)
            
            # Simple PMV-like heuristic mapping to a 0-100 score
            comfort_penalty = abs(temp - 22.5) * 10
            iaq_penalty = max(0, co2 - 800) * 0.1
            total_comfort_score = max(0, 100 - comfort_penalty - iaq_penalty)
            
            result = {
                "current_temp": temp,
                "current_co2": co2,
                "comfort_score_0_to_100": round(total_comfort_score, 1),
                "current_energy_kw": chiller_load,
                "analysis": "Ideal temp ~22.5C, CO2 < 800ppm. Maximize score while minimizing energy_kw."
            }
            return json.dumps(result, indent=2)
        except Exception as e:
            return json.dumps({"error": f"Failed to evaluate metrics: {str(e)}"})

async def update_hvac_setpoints(cooling_setpoint: float, heating_setpoint: float, ventilation_rate: float, reasoning: str) -> str:
    """Updates the building HVAC cooling, heating, and ventilation setpoints."""
    payload = {
        "cooling_setpoint_c": cooling_setpoint,
        "heating_setpoint_c": heating_setpoint,
        "ventilation_rate_ach": ventilation_rate,
        "reasoning": reasoning
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{BACKEND_URL}/control/setpoints", json=payload)
            response.raise_for_status()
            return json.dumps({"status": "success", "updated_setpoints": payload}, indent=2)
        except Exception as e:
            return json.dumps({"error": f"Failed to update setpoints: {str(e)}"})

async def predict_energy(cooling_setpoint: float, heating_setpoint: float, hours_ahead: int = 24) -> str:
    """Predicts energy consumption for a given time window using proposed setpoints."""
    base_load = 5.0
    # Simplified simulation heuristic
    cooling_penalty = max(0, 26.0 - cooling_setpoint) * 2.5
    heating_penalty = max(0, heating_setpoint - 18.0) * 2.0
    
    predicted_kw = base_load + cooling_penalty + heating_penalty
    total_kwh = predicted_kw * hours_ahead
    
    result = {
        "predicted_avg_kw": round(predicted_kw, 2),
        "total_kwh_for_window": round(total_kwh, 2),
        "window_hours": hours_ahead
    }
    return json.dumps(result, indent=2)
