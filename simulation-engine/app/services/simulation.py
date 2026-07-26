import asyncio
import random
import csv
import os
from datetime import datetime, timezone
from app.schemas.telemetry import TelemetryReading, HVACSetpoint

class SimulationEngine:
    def __init__(self):
        self.is_running = False
        self.dataset = self._load_dataset()
        self.current_idx = 0
        
        if self.dataset:
            first_row = self.dataset[0]
            dt = datetime.strptime(first_row["timestamp"], "%Y-%m-%dT%H:%M")
            self.sim_time = dt.replace(tzinfo=timezone.utc)
        else:
            self.sim_time = datetime(2026, 7, 26, 8, 0, 0, tzinfo=timezone.utc)
            
        self.current_state = self._generate_baseline()
        self.setpoints = HVACSetpoint(
            cooling_setpoint_c=24.0,
            heating_setpoint_c=20.0,
            ventilation_rate_ach=1.5,
            reasoning="Baseline"
        )
        self.listeners = []
        self.history = []
        self.agent_logs = []
        self.baseline_cumulative_kwh = 0.0
        self.optimized_cumulative_kwh = 0.0
        
    def _load_dataset(self):
        data = []
        # Path assumes execution from `backend/` directory
        file_path = os.path.join(os.getcwd(), "data", "building_dataset.csv")
        try:
            with open(file_path, "r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    data.append({
                        "timestamp": row["timestamp"],
                        "outdoor_temp_c": float(row["outdoor_temp_c"]),
                        "baseline_lighting_kw": float(row["baseline_lighting_kw"]),
                        "baseline_equipment_kw": float(row["baseline_equipment_kw"]),
                        "co2_generation_rate": float(row["co2_generation_rate"])
                    })
        except Exception as e:
            print(f"Failed to load dataset from {file_path}: {e}")
        return data

    def _generate_baseline(self) -> TelemetryReading:
        return TelemetryReading(
            timestamp=self.sim_time,
            zone_temp_c=23.5,
            zone_co2_ppm=450.0,
            iaq_score=95.0,
            outdoor_temp_c=25.0,
            chiller_load_kw=15.0,
            lighting_load_kw=5.0,
            equipment_load_kw=10.0,
            hvac_mode="cooling"
        )

    def register_listener(self, queue: asyncio.Queue):
        self.listeners.append(queue)
    
    def unregister_listener(self, queue: asyncio.Queue):
        if queue in self.listeners:
            self.listeners.remove(queue)

    def update_setpoints(self, new_setpoints: HVACSetpoint):
        self.setpoints = new_setpoints

    def add_agent_log(self, log: dict):
        log["timestamp"] = self.sim_time.isoformat()
        self.agent_logs.insert(0, log) # Most recent first
        if len(self.agent_logs) > 1000:
            self.agent_logs.pop()

    def reset(self):
        self.current_idx = 0
        if self.dataset:
            dt = datetime.strptime(self.dataset[0]["timestamp"], "%Y-%m-%dT%H:%M")
            self.sim_time = dt.replace(tzinfo=timezone.utc)
        self.current_state = self._generate_baseline()
        self.setpoints = HVACSetpoint(
            cooling_setpoint_c=24.0,
            heating_setpoint_c=20.0,
            ventilation_rate_ach=1.5,
            reasoning="Baseline"
        )
        self.history.clear()
        self.agent_logs.clear()
        self.baseline_cumulative_kwh = 0.0
        self.optimized_cumulative_kwh = 0.0

    async def _step_mock(self):
        if not self.dataset:
            self.sim_time = datetime.now(timezone.utc)
            return

        # Get current dataset row
        row = self.dataset[self.current_idx]
        self.current_idx = (self.current_idx + 1) % len(self.dataset)
        
        dt = datetime.strptime(row["timestamp"], "%Y-%m-%dT%H:%M")
        self.sim_time = dt.replace(tzinfo=timezone.utc)
        
        new_outdoor_temp = row["outdoor_temp_c"]
        target_lighting = row["baseline_lighting_kw"]
        target_equipment = row["baseline_equipment_kw"]
        co2_generation = row["co2_generation_rate"]
        
        lighting_load = self.current_state.lighting_load_kw + (target_lighting - self.current_state.lighting_load_kw) * 0.1
        equipment_load = self.current_state.equipment_load_kw + (target_equipment - self.current_state.equipment_load_kw) * 0.1

        internal_heat = (lighting_load + equipment_load) * 0.002
        outdoor_influence = (new_outdoor_temp - self.current_state.zone_temp_c) * 0.005
        
        hvac_influence = 0.0
        chiller_load = 0.0
        hvac_mode = "off"
        
        if self.current_state.zone_temp_c > self.setpoints.cooling_setpoint_c:
            hvac_influence = -0.08
            hvac_mode = "cooling"
            chiller_load = 25.0 + random.uniform(-1, 1)
        elif self.current_state.zone_temp_c < self.setpoints.heating_setpoint_c:
            hvac_influence = 0.05
            hvac_mode = "heating"
            chiller_load = 2.0 + random.uniform(-0.1, 0.1)
        else:
            hvac_mode = "off"
            chiller_load = 1.0 + random.uniform(0, 0.5)

        ventilation_removal = self.setpoints.ventilation_rate_ach * 0.1
        
        new_temp = self.current_state.zone_temp_c + outdoor_influence + internal_heat + hvac_influence + random.uniform(-0.01, 0.01)
        new_co2 = max(400.0, self.current_state.zone_co2_ppm + co2_generation - ventilation_removal + random.uniform(-1, 1))

        # Baseline simulation for comparison
        baseline_cooling_sp = 22.0
        baseline_heating_sp = 21.0
        baseline_chiller_load = 0.0
        if self.current_state.zone_temp_c > baseline_cooling_sp:
            baseline_chiller_load = 28.0 + random.uniform(-1, 1)
        elif self.current_state.zone_temp_c < baseline_heating_sp:
            baseline_chiller_load = 3.0 + random.uniform(-0.1, 0.1)
        else:
            baseline_chiller_load = 1.0 + random.uniform(0, 0.5)

        # Energy consumption over this 5-minute step (kW * hours)
        self.baseline_cumulative_kwh += baseline_chiller_load * (5.0 / 60.0)
        self.optimized_cumulative_kwh += chiller_load * (5.0 / 60.0)

        self.current_state = TelemetryReading(
            timestamp=self.sim_time,
            zone_temp_c=round(new_temp, 2),
            zone_co2_ppm=round(new_co2, 1),
            iaq_score=round(max(0, 100 - (new_co2 - 400)/20), 1),
            outdoor_temp_c=round(new_outdoor_temp, 2),
            chiller_load_kw=round(chiller_load, 2),
            lighting_load_kw=round(lighting_load, 2),
            equipment_load_kw=round(equipment_load, 2),
            hvac_mode=hvac_mode,
            baseline_cumulative_kwh=round(self.baseline_cumulative_kwh, 2),
            optimized_cumulative_kwh=round(self.optimized_cumulative_kwh, 2)
        )
        
        self.history.append(self.current_state)
        if len(self.history) > 3600:
            self.history.pop(0)

        for q in self.listeners:
            if not q.full():
                await q.put(self.current_state)

    async def run_loop(self):
        self.is_running = True
        while self.is_running:
            await self._step_mock()
            await asyncio.sleep(1.0)

simulation_engine = SimulationEngine()
