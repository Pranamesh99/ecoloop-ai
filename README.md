# EcoLoop AI 🌍

EcoLoop AI is a **Physical AI Proof-of-Concept (PoC)** designed to autonomously optimize building energy systems. By pairing a physics-based energy simulation engine with open-source LLMs and standardized communication protocols (Model Context Protocol), we transform buildings from passive energy consumers into active, self-correcting agents capable of continuous, real-time optimization.

---

## 🏆 Hackathon Deliverables

This repository contains all the required components for a fully automated closed-loop smart building pipeline.

### 1. The Simulation Engine (EnergyPlus & Surrogate Physics Model)
- **Building Models (`.idf`)**: Standard EnergyPlus Input Data Files representing a commercial baseline and an optimized layout are provided in the `simulation-engine/energyplus_models/` directory, serving as the physical digital twin source of truth.
- **Surrogate Engine**: To achieve a 3-minute video demonstration, the backend utilizes a high-speed Python Surrogate Physics Engine (`simulation-engine/app/services/simulation.py`). It fast-forwards time, accurately simulating thermodynamic heat transfer, CO2 accumulation, and internal loads.
- **Real-World Dataset**: The simulation is driven by real historical weather data (New York Summer Heatwave - July 2023) combined with ASHRAE standard commercial load profiles, ensuring the AI battles real-world conditions.

### 2. The Cognitive Engine (LLM & MCP Protocol)
- **Agent Orchestration**: The AI Agent (`cognitive-agent/src/agent.py`) connects to the simulation via WebSocket.
- **Model Context Protocol (MCP)**: The agent utilizes custom MCP tools to parse telemetry, evaluate comfort indices, and dynamically inject forward control actions (e.g., updating HVAC setpoints in real-time) to optimize the active simulation.

### 3. Quantitative Savings Dashboard
A premium, glassmorphic Next.js frontend (`savings-dashboard/src/app/page.tsx`) provides an enterprise-grade visualization of the closed-loop system:
- **Interactive 3D Digital Twin**: Built with React Three Fiber, the building model visually reacts to the AI. The blue core dynamically pulses in intensity based on the exact live Chiller Load (kW) requested by the AI.
- **Live Energy Breakdown**: Tracks real-time telemetry (Zone Temp, CO2, IAQ Score, Chiller Load) against strict thermal comfort bounds.
- **Quantitative KPI**: A live **⚡ Energy Saved (%)** metric mathematically compares the AI's cumulative energy consumption against standard, rigid baseline scheduling.
- **Data Journal & Export Hub**: Complete audit trails of LLM decisions and Excel/PDF data export capabilities.

---

## 🚀 Running the Project (Local Installation)

To run the full stack locally on your machine without Docker dependencies:

### 1. Requirements
- Python 3.9+
- Node.js 18+

### 2. Automated Run Script
Simply run the included bash script. It will automatically create a Python virtual environment, install all required pip and npm dependencies, and start the FastAPI Backend, MCP Agent, and Next.js Frontend simultaneously.

```bash
chmod +x scripts/run_local.sh
./scripts/run_local.sh
```

### 3. Access the Dashboard
Once the services are booted, open your browser and navigate to:
**`http://localhost:3000`**

*Wait approximately 10-15 seconds for the Next.js development server to fully compile. You will see the WebSocket connect and the real-world dataset begin streaming.*

---

## 🧠 System Architecture Overview
For a deeper dive into the tool-calling architecture, prompt latency management strategies, and how we ensure strict adherence to human thermal comfort bounds, please review the included `docs/ARCHITECTURE.md` file.

## 📊 Presentation Deck
For the required slide presentation, please reference the `docs/PRESENTATION.md` file, which contains the exact slide-by-slide outline detailing the problem, solution, results, and future roadmap.
