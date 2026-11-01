# ADNOC Alarm Champion & Operational Integrity Derivation Rules

**Document Reference:** ADNOC-OASIS-KPI-SOP-2026-V4  
**Classification:** ADNOC Internal Technical Specification  
**Applicable Units:** Gathering Centers GC-01, GC-02, GC-03, GC-04, GC-05  

---

## 1. Executive Metric State Classifications

All operational Gathering Centers evaluate alarm performance continuously over rolling 1-hour and 10-minute windows according to ANSI/ISA-18.2 / EEMUA 191 standards adapted for ADNOC upstream operations.

### State 1: Robust Performance (Target Operational Baseline)
- **Average Alarm Rate / Hour:** $\le 6.0$ alarms per operator console per hour.
- **Peak Alarm Rate / 10 Minutes:** $\le 10.0$ alarms in any rolling 10-minute interval.
- **% Upset Time:** $\le 1.0\%$ of operational time.
- **Action Required:** None. System operates within optimal human cognitive response capacity.

### State 2: Stable Performance (Acceptable with Monitoring)
- **Average Alarm Rate / Hour:** $> 6.0$ and $\le 12.0$ alarms per hour.
- **Peak Alarm Rate / 10 Minutes:** $> 10.0$ and $\le 50.0$ alarms per 10 minutes.
- **% Upset Time:** $> 1.0\%$ and $\le 2.5\%$.
- **Action Required:** Operator logs recurring tags; shift supervisor reviews during handover.

### State 3: Reactive Performance (Impaired Operator Action)
- **Average Alarm Rate / Hour:** $> 12.0$ and $\le 60.0$ alarms per hour.
- **Peak Alarm Rate / 10 Minutes:** $> 50.0$ and $\le 500.0$ alarms per 10 minutes.
- **% Upset Time:** $> 2.5\%$ and $\le 10.0\%$.
- **Action Required:** Shift handover requires supervisor endorsement; lead instrumentation engineer dispatched to investigate chatter/chattering tags.

### State 4: Overloaded Performance (Severe Alarm Flood / Emergency)
- **Average Alarm Rate / Hour:** $> 60.0$ alarms per hour.
- **Peak Alarm Rate / 10 Minutes:** $> 500.0$ alarms in 10 minutes.
- **% Upset Time:** $> 10.0\%$.
- **Action Required:** Immediate incident escalation; activate safety override protocols; suppress non-critical nuisance alarms per approved MOC.

---

## 2. Operational Integrity Envelope (OIE) Definitions

1. **Safe Operating Limit (SOL):**
   The threshold beyond which equipment damage, containment loss, or emergency trip risk becomes unacceptable. Typically set at $90\%$ of physical design burst limit.
2. **Operating Window Envelope Limit (OWEL):**
   The target working margin to prevent reaching the SOL. Set at $82\%$ of physical design limit.
3. **PRD Activation (Pressure Relief Device):**
   Any mechanical or automated pressure relief event indicates severe OIE excursion. Any loop with $\ge 3$ excursions in 7 days requires immediate mechanical inspection.

---

## 3. Master Alarm Database (MADB) Discrepancy Governance

- **Aging Categorization:**
  - Category A: $\le 15$ Days (Under routine engineering review)
  - Category B: $16 - 30$ Days (Escalated to Lead Instrument Engineer)
  - Category C: $> 30$ Days (Critical Audit Non-Conformance)
- **Repetitive Alarms (Bad Actors):**
  Any alarm that triggers more than 3 times within 60 minutes without process deviation must be flagged as a bad actor and queued for deadband adjustment.

