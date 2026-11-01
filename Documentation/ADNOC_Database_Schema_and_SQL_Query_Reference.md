# ADNOC OASIS Database Schema, API Specification & Copilot Studio SQL Reference

**Document Version:** 1.0  
**Target Systems:** ADNOC OASIS React Portal, FastAPI Service, Microsoft Copilot Studio (Claude Sonnet 4.6), MCP Server  
**Database File:** `database/adnoc_oasis.db` (SQLite / Microsoft SQL Server Compatible)  
**API Server:** `http://127.0.0.1:8000` (FastAPI)  

---

## 1. Relational Database Schema & Copilot Studio SQL Queries

The SQLite database `adnoc_oasis.db` has been structured with both **Raw Transactional Tables** (corresponding to SharePoint files) and **Aggregated Operational Summary Tables** (powering the live dashboard and Copilot responses).

```
+----------------------------------------------------------------------------------------------------+
|                                      adnoc_oasis.db SCHEMA                                         |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [RAW EVENT TABLES - FROM SHAREPOINT DATA LAKE]                                                    |
|  • raw_alarm_events (Event_ID, Timestamp, Gathering_Center_ID, Console_ID, Plant_Area,              |
|                      Tag_Number, Alarm_Type, Priority, Standing_Duration_Minutes, Acknowledged_By) |
|  • raw_oie_loops (Loop_ID, Loop_Tag, Gathering_Center_ID, Process_Parameter, Design_Limit,        |
|                   Safe_Operating_Limit_SOL, Operating_Window_Envelope_Limit_OWEL, Healthy_Status)  |
|  • raw_madb_discrepancies (Discrepancy_ID, Gathering_Center_ID, Console_ID, Tag_Number,           |
|                            Deviation_Type, DCS_Active_Setting, MADB_Approved_Setting, Aging_Days)  |
|                                                                                                    |
|  [AGGREGATED KPI TABLES - FASTAPI & COPILOT TOOLING]                                               |
|  • gc_performance_summary (gc_id, gc_name, avg_alarm_rate_per_hr, peak_alarm_rate_10min,           |
|                            upset_time_percentage, performance_state, performance_state_code)       |
|  • oie_metrics_summary (gc_id, total_monitored_loops, healthy_loops, sol_excursion_count,          |
|                         owel_breach_count, prd_activation_count, integrity_compliance_pct)        |
|  • madb_discrepancy_summary (gc_id, total_discrepancies, aging_under_15d, aging_over_30d,         |
|                              repetitive_alarms_count, critical_risk_count)                         |
|  • console_health_matrix (console_id, console_name, assigned_gc, assigned_operator,                |
|                           workload_state, active_alarms_count, standing_alarms_count)              |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Table-by-Table Schema & Production SQL Queries for Copilot Studio

Below are the exact SQL queries that **Microsoft Copilot Studio** (or the backend MCP Server) executes to answer operational questions.

### 2.1 Table: `gc_performance_summary` (Alarm Champion States)
Tracks the rolling operational performance category for each Gathering Center.

```sql
CREATE TABLE gc_performance_summary (
    gc_id TEXT PRIMARY KEY,
    gc_name TEXT,
    unit_name TEXT,
    avg_alarm_rate_per_hr REAL,
    peak_alarm_rate_10min INTEGER,
    upset_time_percentage REAL,
    performance_state TEXT,
    performance_state_code INTEGER,
    active_consoles_count INTEGER,
    total_alarms_7d INTEGER,
    last_updated TEXT
);
```

#### Copilot Studio Query 1: Find High-Risk Gathering Centers
> **User Question:** *"Which Gathering Centers are currently in Reactive or Overloaded states?"*

```sql
SELECT 
    gc_id, 
    gc_name, 
    avg_alarm_rate_per_hr, 
    peak_alarm_rate_10min, 
    upset_time_percentage, 
    performance_state 
FROM gc_performance_summary 
WHERE performance_state_code >= 3 
ORDER BY performance_state_code DESC;
```

**Sample Output Data:**
| gc_id | gc_name | avg_alarm_rate_per_hr | peak_alarm_rate_10min | upset_time_percentage | performance_state |
|:---|:---|:---|:---|:---|:---|
| **GC-05** | Gathering Center 05 | 68.4 | 540 | 12.5% | State 4 - Overloaded Performance |
| **GC-04** | Gathering Center 04 | 26.5 | 110 | 4.6% | State 3 - Reactive Performance |

---

### 2.2 Table: `oie_metrics_summary` (Operational Integrity Envelope)
Tracks safe operating limits and pressure relief device activations.

```sql
CREATE TABLE oie_metrics_summary (
    gc_id TEXT PRIMARY KEY,
    total_monitored_loops INTEGER,
    healthy_loops INTEGER,
    unhealthy_loops INTEGER,
    sol_excursion_count INTEGER,
    owel_breach_count INTEGER,
    prd_activation_count INTEGER,
    integrity_compliance_pct REAL
);
```

#### Copilot Studio Query 2: Integrity Envelope Compliance & PRD Trips
> **User Question:** *"What is the integrity compliance rate for GC-03, and have there been any PRD activations?"*

```sql
SELECT 
    gc_id, 
    total_monitored_loops, 
    healthy_loops, 
    sol_excursion_count, 
    prd_activation_count, 
    integrity_compliance_pct 
FROM oie_metrics_summary 
WHERE gc_id = 'GC-03';
```

**Sample Output Data:**
| gc_id | total_monitored_loops | healthy_loops | sol_excursion_count | prd_activation_count | integrity_compliance_pct |
|:---|:---|:---|:---|:---|:---|
| **GC-03** | 70 | 61 | 12 | 2 | 87.1% |

---

### 2.3 Table: `madb_discrepancy_summary` (Master Alarm Database Deviations)
Identifies setpoint deviations, aging over 30 days, and repetitive nuisance tags.

```sql
CREATE TABLE madb_discrepancy_summary (
    gc_id TEXT PRIMARY KEY,
    total_discrepancies INTEGER,
    aging_under_15d INTEGER,
    aging_16_to_30d INTEGER,
    aging_over_30d INTEGER,
    repetitive_alarms_count INTEGER,
    critical_risk_count INTEGER
);
```

#### Copilot Studio Query 3: Discrepancies Aging > 30 Days (Critical Audit Non-Conformance)
> **User Question:** *"How many MADB discrepancies have been aging for more than 30 days across all GCs?"*

```sql
SELECT 
    gc_id, 
    total_discrepancies, 
    aging_over_30d, 
    repetitive_alarms_count, 
    critical_risk_count 
FROM madb_discrepancy_summary 
WHERE aging_over_30d > 10 
ORDER BY aging_over_30d DESC;
```

**Sample Output Data:**
| gc_id | total_discrepancies | aging_over_30d | repetitive_alarms_count | critical_risk_count |
|:---|:---|:---|:---|:---|
| **GC-05** | 136 | 84 | 98 | 32 |
| **GC-04** | 118 | 54 | 72 | 18 |
| **GC-03** | 94 | 28 | 43 | 9 |

---

### 2.4 Table: `console_health_matrix` (Operator Workload & Consoles)
Monitors Consoles 01 to 08, active standing alarms, and assigned operators.

```sql
CREATE TABLE console_health_matrix (
    console_id TEXT PRIMARY KEY,
    console_name TEXT,
    assigned_gc TEXT,
    assigned_operator TEXT,
    workload_state TEXT,
    active_alarms_count INTEGER,
    unacknowledged_count INTEGER,
    standing_alarms_count INTEGER,
    shift_handover_status TEXT
);
```

#### Copilot Studio Query 4: Identify Overloaded Consoles Requiring Shift Escalation
> **User Question:** *"Which consoles have standing alarms greater than 10 or are in a warning workload state?"*

```sql
SELECT 
    console_id, 
    console_name, 
    assigned_gc, 
    assigned_operator, 
    workload_state, 
    active_alarms_count, 
    standing_alarms_count, 
    shift_handover_status 
FROM console_health_matrix 
WHERE standing_alarms_count > 10 OR workload_state LIKE '%Reactive%' OR workload_state LIKE '%Overloaded%';
```

**Sample Output Data:**
| console_id | console_name | assigned_gc | assigned_operator | workload_state | active_alarms_count | standing_alarms_count | shift_handover_status |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **Console-07** | Offshore Receiving Console | GC-04 | Nikhil Shrivastav | Reactive / Warning | 32 | 18 | Action Required |
| **Console-08** | Heavy Crude Stabilization | GC-05 | Mohammed Al-Zaabi | Overloaded / High Alert | 78 | 45 | Escalated to Supervisor |

---

## 3. FastAPI REST Endpoints & Sample JSON Payloads

The FastAPI service runs on `http://127.0.0.1:8000`. The frontend React portal calls these endpoints using native `fetch()` calls.

### 3.1 `GET /api/v1/dashboard/overview?gc=GC-01`
**Sample Response Payload:**
```json
[
  {
    "gc_id": "GC-01",
    "gc_name": "Gathering Center 01",
    "unit_name": "North Field Unit 1",
    "avg_alarm_rate_per_hr": 5.2,
    "peak_alarm_rate_10min": 8,
    "upset_time_percentage": 0.8,
    "performance_state": "State 1 - Robust Performance",
    "performance_state_code": 1,
    "active_consoles_count": 6,
    "total_alarms_7d": 214,
    "last_updated": "2026-11-01 10:00:00"
  }
]
```

### 3.2 `GET /api/v1/dashboard/alarms?gc=GC-03`
**Sample Response Payload:**
```json
{
  "summary": {
    "gc_id": "GC-03",
    "gc_name": "Gathering Center 03",
    "unit_name": "South Compression Unit A",
    "avg_alarm_rate_per_hr": 11.1,
    "peak_alarm_rate_10min": 44,
    "upset_time_percentage": 2.2,
    "performance_state": "State 2 - Stable Performance",
    "performance_state_code": 2
  },
  "hourly_distribution": [
    { "time": "00:00", "alarms": 4, "target": 6 },
    { "time": "04:00", "alarms": 6, "target": 6 },
    { "time": "08:00", "alarms": 11, "target": 6 },
    { "time": "12:00", "alarms": 8, "target": 6 },
    { "time": "16:00", "alarms": 14, "target": 6 },
    { "time": "20:00", "alarms": 5, "target": 6 }
  ],
  "classification_guide": {
    "State 1": "Robust (Rate <= 6, Peak <= 10, Upset <= 1%)",
    "State 2": "Stable (Rate 6-12, Peak 10-50, Upset 1-2.5%)",
    "State 3": "Reactive (Rate 12-60, Peak 50-500, Upset 2.5-10%)",
    "State 4": "Overloaded (Rate > 60, Peak > 500, Upset > 10%)"
  }
}
```

### 3.3 `GET /api/v1/dashboard/oie?gc=GC-03`
**Sample Response Payload:**
```json
[
  {
    "gc_id": "GC-03",
    "total_monitored_loops": 70,
    "healthy_loops": 61,
    "unhealthy_loops": 9,
    "sol_excursion_count": 12,
    "owel_breach_count": 19,
    "prd_activation_count": 2,
    "integrity_compliance_pct": 87.1
  }
]
```

### 3.4 `GET /api/v1/dashboard/consoles`
**Sample Response Payload:**
```json
[
  {
    "console_id": "Console-01",
    "console_name": "Primary Inflow Console",
    "assigned_gc": "GC-01",
    "assigned_operator": "Mohammed Al-Zaabi",
    "workload_state": "Normal / Optimal",
    "active_alarms_count": 3,
    "unacknowledged_count": 0,
    "standing_alarms_count": 1,
    "shift_handover_status": "Verified / Closed"
  },
  {
    "console_id": "Console-08",
    "console_name": "Heavy Crude Stabilization",
    "assigned_gc": "GC-05",
    "assigned_operator": "Mohammed Al-Zaabi",
    "workload_state": "Overloaded / High Alert",
    "active_alarms_count": 78,
    "unacknowledged_count": 21,
    "standing_alarms_count": 45,
    "shift_handover_status": "Escalated to Supervisor"
  }
]
```

---

## 4. How Copilot Studio Synchronizes with This Data

When you upload the 3 Excel/CSV files and the derivation markdown file to **SharePoint**:
1. In **Copilot Studio > Knowledge**, add the SharePoint folder URL.
2. Copilot Studio uses **Generative Answers** to read the granular rows (e.g., tag numbers, timestamps).
3. Simultaneously, when the user is chatting from the React portal, the **`channelData` handshake** passes the active screen and selected GC:
   ```json
   {
     "type": "message",
     "text": "Why is this console in a reactive state?",
     "channelData": {
       "activeScreen": "Console_Management",
       "selectedGC": "GC-04",
       "activeConsole": "Console-07",
       "workloadState": "Reactive / Warning"
     }
   }
   ```
4. Claude Sonnet 4.6 in Copilot Studio matches the active screen metadata directly with the SharePoint knowledge and the database, giving a unified response across both the live dashboard and the AI chat!

