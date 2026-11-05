# ADNOC OASIS Copilot & Operational Command Center

Enterprise-grade AI Assistant and Real-Time Operational Dashboard embedded in the **ADNOC OASIS** (*Operational Assurance System for Integrity and Safety*) Command Center portal.

The solution integrates a **React 19 micro-frontend widget** with **Microsoft Copilot Studio (Claude Sonnet 4.6)** via the **Direct Line v3 REST API (Direct Secret Key Embed)**, backed by a **FastAPI** data service and **SQLite** RDBMS.

---

## 🌟 Key Features

* **4 Live Navigable Operational Dashboards:**
  1. **Alarm Champion Command Center:** Rolling 1-hour and 10-minute performance metrics categorized by States 1 to 4 (Robust, Stable, Reactive, Overloaded).
  2. **Operational Integrity Envelope (OIE):** Safe Operating Limit (SOL) excursions, OWEL margins, and Pressure Relief Device (PRD) activation monitors.
  3. **Master Alarm Database (MADB):** DCS setpoint discrepancies, aging analysis (>30 days audit non-conformance), and repetitive bad actors.
  4. **Consoles & Operator Workload:** Real-time health, active/standing alarms, and workload states for Consoles 01 to 08.
* **Zero-Latency Live Screen & Metrics Tracking:** An invisible prompt context envelope automatically feeds the active dashboard screen, selected Gathering Center (GC-01 to GC-05), and live screen numbers to Copilot Studio on every turn.
* **Direct Line Secret Key Embed:** Natively connects to Microsoft Copilot Studio without third-party or Microsoft WebChat SDK dependencies.
* **SharePoint Data Lake:** Pre-generated granular datasets (1,200 alarm logs, 350 OIE loops, 450 MADB deviations) ready for Copilot Studio Knowledge grounding.
* **Interactive Client Documentation:** Complete 64-feature feasibility matrix with responsive styling and embedded diagrams.

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

* **Node.js:** v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
* **npm:** v9.0.0 or higher (included with Node.js)
* **Python:** v3.10 to v3.13 ([Download Python](https://www.python.org/))
* **pip:** Python package manager

---

## 🚀 Quick Start Guide (How to Run)

### 1. Clone the Repository

```bash
git clone https://github.com/nshrivastavtks/adnoc_chatbot.git
cd adnoc_chatbot
```

---

### 2. Install Dependencies

#### Frontend (Node.js) Dependencies:
```bash
npm install
```

#### Backend (Python) Dependencies:
```bash
pip install -r requirements.txt
```

---

### 3. (Optional) Re-generate Operational Database & SharePoint Data

The database (`database/adnoc_oasis.db`) and SharePoint datasets (`data/Adnoc sharepoint/`) come pre-built. If you ever want to re-seed or regenerate fresh sample data, run:

```bash
python generate_data.py
```

---

### 4. Start the Application

You will run **two terminal windows**: one for the FastAPI backend and one for the React frontend.

#### Terminal 1: Start the FastAPI Backend
```bash
npm run api
```
* The API server will start on: **`http://127.0.0.1:8000`**
* Interactive Swagger API documentation: **`http://127.0.0.1:8000/docs`**
* Health check: **`http://127.0.0.1:8000/api/v1/health`**

#### Terminal 2: Start the React Frontend Portal
```bash
npm run dev
```
* The Vite dev server will start on: **`http://localhost:5173`**
* Open **`http://localhost:5173`** in your browser.

---

## ⚙️ Connecting to Microsoft Copilot Studio

The chat widget includes an in-app connection configuration modal:

1. In the bottom-right corner of the dashboard, click the floating **OASIS Orb** to open the chat window.
2. Click the **⚙️ Gear Icon** in the chat header to open **Copilot Studio Connection Settings**.
3. In **Option 2: Direct Line Secret Key**, paste your Copilot Studio / Azure Bot Direct Line secret key.
4. Click **Save Settings**. The widget will automatically initialize a Direct Line session.

*Alternatively, create a `.env` file in the root directory (see `.env.example`):*
```env
VITE_DIRECT_LINE_SECRET=your_direct_line_secret_key_here
```

---

## 📂 Project Architecture & Directory Structure

```text
adnoc_chatbot/
├── data/
│   └── Adnoc sharepoint/           # Deep-dive operational datasets for SharePoint
│       ├── ADNOC_GC_Alarm_Event_Log_DeepDive.csv / .xlsx
│       ├── ADNOC_OIE_Operational_Integrity_Envelope_Audit.csv / .xlsx
│       ├── ADNOC_MADB_Master_Alarm_Discrepancies_Log.csv / .xlsx
│       └── ADNOC_Console_Health_KPI_Derivations.md
├── database/
│   └── adnoc_oasis.db              # SQLite RDBMS with 7 aggregated & raw tables
├── Documentation/
│   ├── index.html                  # Responsive 64-feature interactive specification
│   ├── ADNOC_AI_Chatbot_Technical_Specification.html
│   └── ADNOC_Database_Schema_and_SQL_Query_Reference.md
├── server/
│   ├── fastapi_server.py           # FastAPI service serving dashboard REST endpoints
│   └── server.js                   # Express.js session and health service
├── src/
│   ├── components/
│   │   ├── MainWebsite.jsx         # 4-view live operational dashboard
│   │   ├── OasisChatWidget.jsx     # Floating chat widget with context synchronization
│   │   ├── OasisOrb.jsx            # 3D animated holographic launcher orb
│   │   ├── ThinkingSection.jsx     # Collapsible reasoning steps accordion
│   │   └── MarkdownRenderer.jsx    # Table & Markdown styling renderer
│   ├── context/
│   │   └── ThemeContext.jsx        # Dark/Light mode theme state
│   └── services/
│       └── copilotService.js       # Direct Line REST engine with prompt envelope
├── generate_data.py                # Synthetic data & database generator
├── package.json                    # NPM scripts & dependencies
├── requirements.txt                # Python backend dependencies
└── README.md
```

---

## 📖 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite React frontend development server (`http://localhost:5173`) |
| `npm run api` | Starts the Python FastAPI backend (`http://127.0.0.1:8000`) |
| `npm run build` | Compiles and builds production assets into `/dist` |
| `npm run preview` | Previews the compiled production build locally |
| `npm run server` | Starts the optional Node.js Express service (`http://localhost:5000`) |

---

## 📄 Client Documentation & Specifications

To review the interactive technical specification prepared for ADNOC leadership:
* Open `Documentation/index.html` directly in any web browser.
* Includes real-time search, color-coded status badges, mobile/tablet responsive layout, and architecture diagrams.
