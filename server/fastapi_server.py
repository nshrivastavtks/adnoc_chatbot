import os
import sqlite3
from typing import Optional, List
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="ADNOC OASIS Operational API",
    description="High-performance backend API serving aggregated metrics for the ADNOC OASIS Command Center & Copilot Agent",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite running on port 5173, 5174, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "database", "adnoc_oasis.db"))

def get_db_connection():
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=500, detail=f"Database file not found at {DB_PATH}. Run generate_data.py first.")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ----------------------------------------------------
# Pydantic Response Models
# ----------------------------------------------------
class GCOverview(BaseModel):
    gc_id: str
    gc_name: str
    unit_name: str
    avg_alarm_rate_per_hr: float
    peak_alarm_rate_10min: int
    upset_time_percentage: float
    performance_state: str
    performance_state_code: int
    active_consoles_count: int
    total_alarms_7d: int
    last_updated: str

class OIEMetrics(BaseModel):
    gc_id: str
    total_monitored_loops: int
    healthy_loops: int
    unhealthy_loops: int
    sol_excursion_count: int
    owel_breach_count: int
    prd_activation_count: int
    integrity_compliance_pct: float

class MADBSummary(BaseModel):
    gc_id: str
    total_discrepancies: int
    aging_under_15d: int
    aging_16_to_30d: int
    aging_over_30d: int
    repetitive_alarms_count: int
    critical_risk_count: int

class ConsoleHealth(BaseModel):
    console_id: str
    console_name: str
    assigned_gc: str
    assigned_operator: str
    workload_state: str
    active_alarms_count: int
    unacknowledged_count: int
    standing_alarms_count: int
    shift_handover_status: str

# ----------------------------------------------------
# REST API Endpoints
# ----------------------------------------------------

@app.get("/api/v1/health")
def health_check():
    """Health check endpoint validating DB accessibility."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT count(*) as count FROM gc_performance_summary")
        count = cursor.fetchone()["count"]
        conn.close()
        return {"status": "ok", "service": "ADNOC OASIS FastAPI", "db_connected": True, "gc_records": count}
    except Exception as e:
        return {"status": "error", "error": str(e)}

@app.get("/api/v1/dashboard/overview", response_model=List[GCOverview])
def get_gc_overview(gc: Optional[str] = Query(None, description="Optional Gathering Center ID filter (e.g. GC-01, GC-03)")):
    """Returns top-level operational performance state and alarm KPIs for all or specific GCs."""
    conn = get_db_connection()
    cursor = conn.cursor()
    if gc:
        cursor.execute("SELECT * FROM gc_performance_summary WHERE gc_id = ?", (gc.upper(),))
    else:
        cursor.execute("SELECT * FROM gc_performance_summary ORDER BY performance_state_code ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/api/v1/dashboard/alarms")
def get_alarm_metrics(gc: Optional[str] = Query(None, description="Optional Gathering Center ID")):
    """Returns deep Alarm Champion metrics including hourly trend distribution."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Summary
    if gc:
        cursor.execute("SELECT * FROM gc_performance_summary WHERE gc_id = ?", (gc.upper(),))
        summary = cursor.fetchone()
        if not summary:
            conn.close()
            raise HTTPException(status_code=44, detail="GC not found")
        summary_dict = dict(summary)
    else:
        cursor.execute("""
            SELECT 
                ROUND(AVG(avg_alarm_rate_per_hr), 1) as avg_rate,
                MAX(peak_alarm_rate_10min) as max_peak,
                ROUND(AVG(upset_time_percentage), 1) as avg_upset,
                SUM(total_alarms_7d) as total_alarms
            FROM gc_performance_summary
        """)
        summary_dict = dict(cursor.fetchone())

    # Hourly distribution for visualization
    hourly_trend = [
        {"time": "00:00", "alarms": 4, "target": 6},
        {"time": "04:00", "alarms": 6, "target": 6},
        {"time": "08:00", "alarms": 11, "target": 6},
        {"time": "12:00", "alarms": 8, "target": 6},
        {"time": "16:00", "alarms": 14, "target": 6},
        {"time": "20:00", "alarms": 5, "target": 6}
    ]

    conn.close()
    return {
        "summary": summary_dict,
        "hourly_distribution": hourly_trend,
        "classification_guide": {
            "State 1": "Robust (Rate <= 6, Peak <= 10, Upset <= 1%)",
            "State 2": "Stable (Rate 6-12, Peak 10-50, Upset 1-2.5%)",
            "State 3": "Reactive (Rate 12-60, Peak 50-500, Upset 2.5-10%)",
            "State 4": "Overloaded (Rate > 60, Peak > 500, Upset > 10%)"
        }
    }

@app.get("/api/v1/dashboard/oie", response_model=List[OIEMetrics])
def get_oie_metrics(gc: Optional[str] = Query(None, description="Optional Gathering Center ID")):
    """Returns Operational Integrity Envelope (OIE) metrics, loop health, SOL and OWEL breach counts."""
    conn = get_db_connection()
    cursor = conn.cursor()
    if gc:
        cursor.execute("SELECT * FROM oie_metrics_summary WHERE gc_id = ?", (gc.upper(),))
    else:
        cursor.execute("SELECT * FROM oie_metrics_summary ORDER BY integrity_compliance_pct DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/api/v1/dashboard/madb", response_model=List[MADBSummary])
def get_madb_metrics(gc: Optional[str] = Query(None, description="Optional Gathering Center ID")):
    """Returns Master Alarm Database (MADB) discrepancy aging categories and repetitive alarms."""
    conn = get_db_connection()
    cursor = conn.cursor()
    if gc:
        cursor.execute("SELECT * FROM madb_discrepancy_summary WHERE gc_id = ?", (gc.upper(),))
    else:
        cursor.execute("SELECT * FROM madb_discrepancy_summary ORDER BY critical_risk_count DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/api/v1/dashboard/consoles", response_model=List[ConsoleHealth])
def get_consoles_matrix(gc: Optional[str] = Query(None, description="Optional Gathering Center ID")):
    """Returns the operational status, workload state, and standing alarm count for Consoles 01 to 08."""
    conn = get_db_connection()
    cursor = conn.cursor()
    if gc:
        cursor.execute("SELECT * FROM console_health_matrix WHERE assigned_gc = ? ORDER BY console_id ASC", (gc.upper(),))
    else:
        cursor.execute("SELECT * FROM console_health_matrix ORDER BY console_id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("fastapi_server:app", host="127.0.0.1", port=8000, reload=True)

