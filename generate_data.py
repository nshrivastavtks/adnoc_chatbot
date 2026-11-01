import os
import random
import datetime
import pandas as pd
import sqlite3

def generate_datasets():
    output_dir = os.path.join(os.path.dirname(__file__), 'data', 'Adnoc sharepoint')
    db_dir = os.path.join(os.path.dirname(__file__), 'database')
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(db_dir, exist_ok=True)
    
    random.seed(42)
    
    gcs = ['GC-01', 'GC-02', 'GC-03', 'GC-04', 'GC-05']
    consoles = [f'Console-{i:02d}' for i in range(1, 9)]
    plant_areas = ['Crude Separation', 'Gas Compression', 'Water Treatment', 'Export Pumping', 'Flare System', 'Sulfur Recovery']
    alarm_types = ['High Alarm (HI)', 'High-High Alarm (HIHI)', 'Low Alarm (LO)', 'Low-Low Alarm (LOLO)', 'Trip Interlock (TRIP)', 'Rate of Change (ROC)']
    priorities = ['Critical', 'High', 'Medium', 'Low']
    operators = ['Mohammed Al-Zaabi', 'Sultan Al-Mansouri', 'Rashid Al-Khouri', 'Ahmed Al-Shehhi', 'Hamad Al-Ameri', 'Gokul Raktate', 'Nikhil Shrivastav']
    
    # ----------------------------------------------------
    # 1. Detailed Alarm Event Log (1,200 events)
    # ----------------------------------------------------
    start_time = datetime.datetime(2026, 10, 25, 0, 0, 0)
    alarm_events = []
    
    for i in range(1, 1201):
        delta_sec = random.randint(0, 7 * 86400) # 7 days
        ts = start_time + datetime.timedelta(seconds=delta_sec)
        gc = random.choice(gcs)
        console = random.choice(consoles)
        area = random.choice(plant_areas)
        prio = random.choices(priorities, weights=[0.1, 0.25, 0.45, 0.2])[0]
        alarm_t = random.choice(alarm_types)
        standing_min = round(random.expovariate(1 / 15) + 1, 1)
        tag = f"{gc.replace('-', '')}-{random.choice(['PT', 'TT', 'FT', 'LT', 'PSV', 'ESD'])}-{random.randint(1001, 8999)}"
        ack_by = random.choice(operators)
        action = random.choice([
            'Throttled control valve to normalize flow',
            'Acknowledged standing alarm; alerted field technician',
            'Reset trip logic post pump swap',
            'Investigated transmitter drift with maintenance crew',
            'Bypassed loop per MOC-2026-884 for scheduled calibration',
            'Adjusted cooling water flow rate'
        ])
        
        alarm_events.append({
            'Event_ID': f"ALM-2026-{i:05d}",
            'Timestamp': ts.strftime('%Y-%m-%d %H:%M:%S'),
            'Gathering_Center_ID': gc,
            'Console_ID': console,
            'Plant_Area': area,
            'Tag_Number': tag,
            'Alarm_Type': alarm_t,
            'Priority': prio,
            'Standing_Duration_Minutes': standing_min,
            'Acknowledged_By': ack_by,
            'Operator_Action': action
        })
        
    df_alarms = pd.DataFrame(alarm_events)
    df_alarms.sort_values(by='Timestamp', inplace=True)
    df_alarms.to_csv(os.path.join(output_dir, 'ADNOC_GC_Alarm_Event_Log_DeepDive.csv'), index=False)
    df_alarms.to_excel(os.path.join(output_dir, 'ADNOC_GC_Alarm_Event_Log_DeepDive.xlsx'), index=False)
    print("[OK] Created Alarm Event Log dataset (CSV & XLSX)")
    print("[OK] Created OIE Audit dataset (CSV & XLSX)")
    print("[OK] Created MADB Discrepancies dataset (CSV & XLSX)")
    print("[OK] Created SQLite Database: database/adnoc_oasis.db with 7 tables")

    # ----------------------------------------------------
    # 2. OIE (Operational Integrity Envelope) Audit Data
    # ----------------------------------------------------
    parameters = ['Pressure (bar)', 'Temperature (°C)', 'Flow (m3/h)', 'Vibration (mm/s)', 'Level (%)']
    oie_records = []
    
    for i in range(1, 351):
        gc = random.choice(gcs)
        param = random.choice(parameters)
        loop_tag = f"LOOP-{gc.replace('-', '')}-{random.choice(['PR', 'TR', 'FR', 'VR', 'LR'])}-{random.randint(101, 999)}"
        design_limit = random.randint(80, 150)
        sol = round(design_limit * 0.9, 1) # Safe Operating Limit
        owel = round(design_limit * 0.82, 1) # Operating Window Envelope Limit
        excursions = random.choices([0, 1, 2, 3, 5, 8], weights=[0.6, 0.2, 0.1, 0.05, 0.03, 0.02])[0]
        prd_active = 'Yes' if excursions >= 3 and random.random() > 0.4 else 'No'
        healthy = 'Healthy' if excursions == 0 and prd_active == 'No' else 'Unhealthy (Excursion/PRD Breach)'
        
        oie_records.append({
            'Loop_ID': f"OIE-LP-{i:04d}",
            'Loop_Tag': loop_tag,
            'Gathering_Center_ID': gc,
            'Process_Parameter': param,
            'Design_Limit': design_limit,
            'Safe_Operating_Limit_SOL': sol,
            'Operating_Window_Envelope_Limit_OWEL': owel,
            'Excursion_Events_Count': excursions,
            'PRD_Activation_Status': prd_active,
            'Healthy_Loop_Status': healthy,
            'Audit_Date': '2026-10-31'
        })
        
    df_oie = pd.DataFrame(oie_records)
    df_oie.to_csv(os.path.join(output_dir, 'ADNOC_OIE_Operational_Integrity_Envelope_Audit.csv'), index=False)
    df_oie.to_excel(os.path.join(output_dir, 'ADNOC_OIE_Operational_Integrity_Envelope_Audit.xlsx'), index=False)
    print("[OK] Created OIE Audit dataset (CSV & XLSX)")

    # ----------------------------------------------------
    # 3. Master Alarm Database (MADB) Discrepancies
    # ----------------------------------------------------
    deviation_types = [
        'Setpoint Mismatch (DCS vs MADB)',
        'Priority Downgrade Unapproved',
        'Deadband Config Divergence',
        'Disabled Alarm without MOC',
        'Suppressed / Shelved Expired'
    ]
    madb_records = []
    
    for i in range(1, 451):
        gc = random.choice(gcs)
        console = random.choice(consoles)
        tag = f"{gc.replace('-', '')}-{random.choice(['PT', 'TT', 'FT', 'LT', 'XV'])}-{random.randint(1001, 4999)}"
        dev = random.choice(deviation_types)
        aging = random.randint(1, 120)
        aging_bucket = '< 15 Days' if aging <= 15 else ('16 - 30 Days' if aging <= 30 else '> 30 Days')
        risk = 'Critical' if aging > 60 or 'Trip' in dev else ('High' if aging > 30 else 'Medium')
        is_repetitive = 'Yes' if random.random() > 0.45 else 'No'
        engineer = random.choice(operators)
        
        madb_records.append({
            'Discrepancy_ID': f"MADB-DISC-{i:05d}",
            'Gathering_Center_ID': gc,
            'Console_ID': console,
            'Tag_Number': tag,
            'Deviation_Type': dev,
            'DCS_Active_Setting': f"{random.randint(50, 95)} % / bar",
            'MADB_Approved_Setting': f"{random.randint(60, 90)} % / bar",
            'Aging_Days': aging,
            'Aging_Category': aging_bucket,
            'Repetitive_Alarm_Flag': is_repetitive,
            'Risk_Ranking': risk,
            'Assigned_Engineer': engineer
        })
        
    df_madb = pd.DataFrame(madb_records)
    df_madb.to_csv(os.path.join(output_dir, 'ADNOC_MADB_Master_Alarm_Discrepancies_Log.csv'), index=False)
    df_madb.to_excel(os.path.join(output_dir, 'ADNOC_MADB_Master_Alarm_Discrepancies_Log.xlsx'), index=False)
    print("[OK] Created MADB Discrepancies dataset (CSV & XLSX)")

    # ----------------------------------------------------
    # 4. Generate SQLite Aggregated RDBMS (`adnoc_oasis.db`)
    # ----------------------------------------------------
    db_path = os.path.join(db_dir, 'adnoc_oasis.db')
    if os.path.exists(db_path):
        os.remove(db_path)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Table 1: Raw Alarms
    df_alarms.to_sql('raw_alarm_events', conn, index=False)
    
    # Table 2: Raw OIE
    df_oie.to_sql('raw_oie_loops', conn, index=False)
    
    # Table 3: Raw MADB
    df_madb.to_sql('raw_madb_discrepancies', conn, index=False)

    # Table 4: Aggregated GC Summary (Alarm Champion States 1-4)
    # State 1: Rate <= 6, Peak <= 10, % Upset <= 1%
    # State 2: Rate 6-12, Peak 10-50, % Upset 1-2.5%
    # State 3: Rate 12-60, Peak 50-500, % Upset 2.5-10%
    # State 4: Rate > 60, Peak > 500, % Upset > 10%
    cursor.execute("""
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
    )
    """)

    gc_data = [
        ('GC-01', 'Gathering Center 01', 'North Field Unit 1', 5.2, 8, 0.8, 'State 1 - Robust Performance', 1, 6, 214, '2026-11-01 10:00:00'),
        ('GC-02', 'Gathering Center 02', 'North Field Unit 2', 9.4, 28, 1.8, 'State 2 - Stable Performance', 2, 7, 342, '2026-11-01 10:00:00'),
        ('GC-03', 'Gathering Center 03', 'South Compression Unit A', 11.1, 44, 2.2, 'State 2 - Stable Performance', 2, 8, 398, '2026-11-01 10:00:00'),
        ('GC-04', 'Gathering Center 04', 'Offshore Receiving Terminal', 26.5, 110, 4.6, 'State 3 - Reactive Performance', 3, 5, 680, '2026-11-01 10:00:00'),
        ('GC-05', 'Gathering Center 05', 'Central Heavy Crude Treating', 68.4, 540, 12.5, 'State 4 - Overloaded Performance', 4, 8, 1420, '2026-11-01 10:00:00')
    ]
    cursor.executemany("INSERT INTO gc_performance_summary VALUES (?,?,?,?,?,?,?,?,?,?,?)", gc_data)

    # Table 5: OIE Aggregated Summary
    cursor.execute("""
    CREATE TABLE oie_metrics_summary (
        gc_id TEXT PRIMARY KEY,
        total_monitored_loops INTEGER,
        healthy_loops INTEGER,
        unhealthy_loops INTEGER,
        sol_excursion_count INTEGER,
        owel_breach_count INTEGER,
        prd_activation_count INTEGER,
        integrity_compliance_pct REAL
    )
    """)

    oie_summary = [
        ('GC-01', 70, 68, 2, 2, 4, 0, 97.1),
        ('GC-02', 70, 64, 6, 8, 14, 1, 91.4),
        ('GC-03', 70, 61, 9, 12, 19, 2, 87.1),
        ('GC-04', 70, 52, 18, 28, 41, 5, 74.3),
        ('GC-05', 70, 41, 29, 45, 62, 11, 58.6)
    ]
    cursor.executemany("INSERT INTO oie_metrics_summary VALUES (?,?,?,?,?,?,?,?)", oie_summary)

    # Table 6: MADB Aggregated Summary
    cursor.execute("""
    CREATE TABLE madb_discrepancy_summary (
        gc_id TEXT PRIMARY KEY,
        total_discrepancies INTEGER,
        aging_under_15d INTEGER,
        aging_16_to_30d INTEGER,
        aging_over_30d INTEGER,
        repetitive_alarms_count INTEGER,
        critical_risk_count INTEGER
    )
    """)

    madb_summary = [
        ('GC-01', 34, 22, 8, 4, 11, 2),
        ('GC-02', 68, 30, 24, 14, 27, 5),
        ('GC-03', 94, 38, 28, 28, 43, 9),
        ('GC-04', 118, 28, 36, 54, 72, 18),
        ('GC-05', 136, 18, 34, 84, 98, 32)
    ]
    cursor.executemany("INSERT INTO madb_discrepancy_summary VALUES (?,?,?,?,?,?,?)", madb_summary)

    # Table 7: Consoles Health Matrix
    cursor.execute("""
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
    )
    """)

    consoles_data = [
        ('Console-01', 'Primary Inflow Console', 'GC-01', 'Mohammed Al-Zaabi', 'Normal / Optimal', 3, 0, 1, 'Verified / Closed'),
        ('Console-02', 'High Pressure Separation', 'GC-01', 'Sultan Al-Mansouri', 'Normal / Optimal', 4, 1, 2, 'Verified / Closed'),
        ('Console-03', 'Gas Compression Console A', 'GC-02', 'Rashid Al-Khouri', 'Stable / Moderate', 11, 2, 4, 'Verified / Closed'),
        ('Console-04', 'Gas Compression Console B', 'GC-02', 'Ahmed Al-Shehhi', 'Stable / Moderate', 9, 0, 3, 'Verified / Closed'),
        ('Console-05', 'Main Gathering Command', 'GC-03', 'Hamad Al-Ameri', 'Stable / High Focus', 14, 3, 6, 'Shift Review Pending'),
        ('Console-06', 'Produced Water Injection', 'GC-03', 'Gokul Raktate', 'Stable / High Focus', 12, 1, 5, 'Verified / Closed'),
        ('Console-07', 'Offshore Receiving Console', 'GC-04', 'Nikhil Shrivastav', 'Reactive / Warning', 32, 8, 18, 'Action Required'),
        ('Console-08', 'Heavy Crude Stabilization', 'GC-05', 'Mohammed Al-Zaabi', 'Overloaded / High Alert', 78, 21, 45, 'Escalated to Supervisor')
    ]
    cursor.executemany("INSERT INTO console_health_matrix VALUES (?,?,?,?,?,?,?,?,?)", consoles_data)

    conn.commit()
    conn.close()
    print("[OK] Created SQLite Database: database/adnoc_oasis.db with 7 tables")

if __name__ == '__main__':
    generate_datasets()
