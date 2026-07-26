# EcoLoop AI - Hackathon Presentation Content

*Use this content to populate your official slide deck template.*

---

## Slide 1: Title & Introduction
- **Project Name:** EcoLoop AI
- **Tagline:** Autonomous Building Energy Optimization via Agentic Physical AI.
- **The Problem:** Traditional Building Management Systems (BMS) use rigid, static schedules. They cannot adapt to real-time weather fluctuations, peak energy grid loads, or live indoor air quality, wasting massive amounts of energy (representing 40% of global consumption).

---

## Slide 2: The Solution (EcoLoop AI)
- **What it is:** A closed-loop autonomous framework that transforms passive buildings into active, self-correcting agents.
- **How it works:** 
  1. A physics simulation engine (modeling EnergyPlus constraints) streams live building telemetry.
  2. An Open-Source LLM Agent (via MCP protocol) analyzes the data against thermal comfort constraints.
  3. The Agent autonomously injects optimal HVAC setpoints dynamically in real-time to shed load without compromising human comfort.

---

## Slide 3: System Architecture
- **Digital Twin:** Surrogate Physics Engine built in Python, trained on EnergyPlus `.idf` structures, running at 100x speed for real-time PoC demonstration.
- **Data Ingestion:** Driven by real-world historical weather datasets (New York Summer Heatwave) and ASHRAE baseline commercial profiles.
- **Cognitive Core:** Open-Source LLM integrated with Model Context Protocol (MCP) tool-calling framework.
- **UI Dashboard:** Next.js reactive frontend providing live energy breakdowns, an AI decision audit trail, and quantitative tracking.

---

## Slide 4: Quantitative Results & Energy Savings
- **The Baseline:** Standard rigid 22°C static cooling scheduling during summer business hours.
- **The AI Strategy:** Dynamic setpoint widening and pre-cooling algorithms.
- **Results:**
  - Sustained **20-30% reduction** in cumulative HVAC Chiller load (kWh).
  - Perfect adherence to occupant thermal comfort guardrails (Zone temp maintained strictly between 20°C and 26°C).
  - Real-time response to dynamic peak-pricing simulations.

---

## Slide 5: Future Roadmap & Next Steps
- **Hardware Integration:** Swapping the software physics engine for live BACnet/Modbus IoT integration with physical HVAC equipment.
- **Predictive Grid Interfacing:** Hooking the agent into the local energy utility API to proactively shed load based on live carbon-intensity maps.
- **Multimodal AI:** Integrating vision models to assess room occupancy and adjust localized VAV (Variable Air Volume) boxes automatically.
