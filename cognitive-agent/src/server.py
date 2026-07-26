import sys
from fastmcp import FastMCP
from tools import read_sensor_data, evaluate_comfort_vs_energy, update_hvac_setpoints, predict_energy

# Initialize FastMCP Server
mcp = FastMCP("EcoLoopAI")

@mcp.tool()
async def read_sensors(history_minutes: int = 15) -> str:
    """Reads current and historical sensor telemetry data (Temperature, IAQ, CO2, Chiller load) from the building."""
    return await read_sensor_data(history_minutes)

@mcp.tool()
async def analyze_comfort_energy() -> str:
    """Calculates the current PMV (Predicted Mean Vote) comfort score vs predicted energy consumption based on current setpoints."""
    return await evaluate_comfort_vs_energy()

@mcp.tool()
async def set_hvac(cooling_setpoint: float, heating_setpoint: float, ventilation_rate: float, reasoning: str) -> str:
    """Updates the building HVAC cooling, heating, and ventilation setpoints."""
    return await update_hvac_setpoints(cooling_setpoint, heating_setpoint, ventilation_rate, reasoning)

@mcp.tool()
async def predict_energy_usage(cooling_setpoint: float, heating_setpoint: float, hours_ahead: int = 24) -> str:
    """Predicts the energy consumption for the next N hours given proposed setpoints."""
    return await predict_energy(cooling_setpoint, heating_setpoint, hours_ahead)

if __name__ == "__main__":
    # Use standard stdio transport for MCP
    mcp.run()
