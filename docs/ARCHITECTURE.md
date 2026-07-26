# EcoLoop AI: System Architecture

EcoLoop AI is a closed-loop Physical AI Proof-of-Concept designed to autonomously optimize building energy systems. It replaces rigid BMS scheduling with dynamic, LLM-driven setpoints.

## 1. The Simulation Engine (Surrogate Physics Model)
Due to the constraints of demonstrating a multi-day building simulation in real-time (100x speed), EcoLoop AI utilizes a **Surrogate Physics Engine** written in Python (`backend/app/services/simulation.py`). 
- **Dataset Integration**: The engine ingests historical real-world weather data (New York, July 2023) alongside baseline lighting and equipment load parameters.
- **Physical Dynamics**: The internal Zone Temperature and Chiller Load are mathematically calculated in real-time, factoring in the external weather, internal heat generation, and the active HVAC cooling power. 
- **Digital Twin Models**: Standard EnergyPlus `.idf` models representing the physical building parameters are provided in `/backend/energyplus_models/` to act as the source-of-truth for the physics engine parameters.

## 2. The Cognitive Engine & MCP Protocol
We employ an open-source LLM orchestrating an agentic loop via the Model Context Protocol (MCP).
- **Communication Bus**: The LLM agent (`mcp/src/agent.py`) connects to the backend simulation engine via an asynchronous WebSocket. 
- **Tool-Calling Architecture**: The LLM uses custom tools (e.g., `adjust_setpoints`) to inject forward control actions into the live simulation based on the sensor telemetry it parses.

## 3. Closed-Loop Execution Framework
1. **Feedback**: The engine streams telemetry (Temp, CO2, IAQ, Chiller Load) to the Agent via WebSocket at 1Hz (representing 5 simulation minutes).
2. **Reasoning**: The LLM analyzes the data against target bounds (e.g., thermal comfort limits and peak load pricing thresholds).
3. **Control Actions**: The LLM computes the optimal HVAC setpoints to maintain comfort while aggressively shedding chiller load.
4. **Forward Injection**: The setpoints are POSTed to the backend's `/api/v1/control` endpoint, instantly affecting the physics calculation in the very next tick.

## 4. Prompt Engineering & Latency
To handle rapid streaming data and avoid LLM prompt bloat:
- **Rolling Context Windows**: The `agent.py` script limits its memory of past telemetry and actions to avoid hitting token limits, retaining only the most recent essential state.
- **System Instructions**: The LLM is given strict guardrails (e.g., "NEVER let Zone Temp exceed 26°C or drop below 20°C") to guarantee occupant thermal comfort regardless of aggressive energy shedding.
