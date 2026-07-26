from pydantic import BaseModel, Field
from datetime import datetime

class TelemetryReading(BaseModel):
    timestamp: datetime
    zone_temp_c: float = Field(..., description="Zone temperature in Celsius")
    zone_co2_ppm: float = Field(..., description="Zone CO2 in ppm")
    iaq_score: float = Field(..., description="Indoor Air Quality score (0-100)")
    outdoor_temp_c: float = Field(..., description="Outdoor temperature in Celsius")
    chiller_load_kw: float = Field(..., description="Chiller load in kW")
    lighting_load_kw: float = Field(default=0.0, description="Lighting load in kW")
    equipment_load_kw: float = Field(default=0.0, description="Equipment load in kW")
    hvac_mode: str = Field(..., description="Current HVAC mode (e.g., cooling, heating, off)")
    baseline_cumulative_kwh: float = Field(default=0.0, description="Baseline cumulative energy consumption in kWh")
    optimized_cumulative_kwh: float = Field(default=0.0, description="Optimized cumulative energy consumption in kWh")

class HVACSetpoint(BaseModel):
    cooling_setpoint_c: float
    heating_setpoint_c: float
    ventilation_rate_ach: float
    reasoning: str
