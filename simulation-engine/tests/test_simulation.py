import pytest
import asyncio
from datetime import datetime, timezone
from app.services.simulation import SimulationEngine
from app.schemas.telemetry import HVACSetpoint

def test_generate_baseline():
    engine = SimulationEngine()
    baseline = engine._generate_baseline()
    assert baseline.zone_temp_c == 23.5
    assert baseline.zone_co2_ppm == 450.0
    assert baseline.lighting_load_kw == 5.0
    assert baseline.equipment_load_kw == 10.0

@pytest.mark.asyncio
async def test_step_mock_advances_time():
    engine = SimulationEngine()
    initial_time = engine.sim_time
    await engine._step_mock()
    assert engine.sim_time > initial_time
    assert len(engine.history) == 1

def test_add_agent_log():
    engine = SimulationEngine()
    log = {"action": "test"}
    engine.add_agent_log(log)
    assert len(engine.agent_logs) == 1
    assert "timestamp" in engine.agent_logs[0]

def test_reset():
    engine = SimulationEngine()
    engine.add_agent_log({"action": "test"})
    assert len(engine.agent_logs) == 1
    engine.reset()
    assert len(engine.agent_logs) == 0
