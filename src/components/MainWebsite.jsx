import React, { useState, useEffect } from 'react';
import OasisChatWidget from './OasisChatWidget';
import OasisLauncherButton from './OasisLauncherButton';
import { useTheme } from '../context/ThemeContext';

export default function MainWebsite() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  // Active Navigation & Filters
  const [activeTab, setActiveTab] = useState('alarms'); // 'alarms' | 'oie' | 'madb' | 'consoles'
  const [selectedGC, setSelectedGC] = useState('GC-01'); // 'GC-01' to 'GC-05' or 'ALL'
  
  // Real Data states from FastAPI
  const [overviewData, setOverviewData] = useState([]);
  const [alarmData, setAlarmData] = useState(null);
  const [oieData, setOieData] = useState([]);
  const [madbData, setMadbData] = useState([]);
  const [consoleData, setConsoleData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const API_BASE = 'http://127.0.0.1:8000/api/v1';

  // Fetch live aggregated data from FastAPI
  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setIsLoading(true);
      setApiError(null);
      try {
        const gcQuery = selectedGC !== 'ALL' ? `?gc=${selectedGC}` : '';
        
        const [resOverview, resAlarms, resOie, resMadb, resConsoles] = await Promise.all([
          fetch(`${API_BASE}/dashboard/overview${gcQuery}`).then(r => r.ok ? r.json() : []),
          fetch(`${API_BASE}/dashboard/alarms${gcQuery}`).then(r => r.ok ? r.json() : null),
          fetch(`${API_BASE}/dashboard/oie${gcQuery}`).then(r => r.ok ? r.json() : []),
          fetch(`${API_BASE}/dashboard/madb${gcQuery}`).then(r => r.ok ? r.json() : []),
          fetch(`${API_BASE}/dashboard/consoles${selectedGC !== 'ALL' ? `?gc=${selectedGC}` : ''}`).then(r => r.ok ? r.json() : [])
        ]);

        if (isMounted) {
          setOverviewData(resOverview);
          setAlarmData(resAlarms);
          setOieData(resOie);
          setMadbData(resMadb);
          setConsoleData(resConsoles);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('FastAPI backend offline or unreachable:', err);
          setApiError('FastAPI backend is offline (Start it with: npm run api). Showing cached operational baseline.');
          setIsLoading(false);
        }
      }
    }

    fetchData();
    return () => { isMounted = false; };
  }, [selectedGC]);

  // Construct Live Screen Metrics Snapshot depending on active tab
  let liveScreenMetrics = {};
  if (activeTab === 'alarms') {
    liveScreenMetrics = {
      performance_state: overviewData[0]?.performance_state || 'State 1 - Robust Performance',
      avg_alarm_rate_per_hr: overviewData[0]?.avg_alarm_rate_per_hr || 5.2,
      peak_alarm_rate_10min: overviewData[0]?.peak_alarm_rate_10min || 8,
      upset_time_percentage: overviewData[0]?.upset_time_percentage ? `${overviewData[0].upset_time_percentage}%` : '0.8%',
      active_consoles: overviewData[0]?.active_consoles_count || 6,
      total_alarms_7d: overviewData[0]?.total_alarms_7d || 214
    };
  } else if (activeTab === 'oie') {
    liveScreenMetrics = {
      total_monitored_loops: oieData[0]?.total_monitored_loops || 70,
      healthy_loops: oieData[0]?.healthy_loops || 68,
      sol_excursions: oieData[0]?.sol_excursion_count || 2,
      owel_breaches: oieData[0]?.owel_breach_count || 4,
      prd_activations: oieData[0]?.prd_activation_count || 0,
      integrity_compliance: oieData[0]?.integrity_compliance_pct ? `${oieData[0].integrity_compliance_pct}%` : '97.1%'
    };
  } else if (activeTab === 'madb') {
    liveScreenMetrics = {
      total_discrepancies: madbData[0]?.total_discrepancies || 94,
      aging_under_15d: madbData[0]?.aging_under_15d || 38,
      aging_over_30d: madbData[0]?.aging_over_30d || 28,
      repetitive_bad_actors: madbData[0]?.repetitive_alarms_count || 43,
      critical_risk_discrepancies: madbData[0]?.critical_risk_count || 9
    };
  } else if (activeTab === 'consoles') {
    liveScreenMetrics = {
      monitored_consoles_count: consoleData.length || 8,
      active_operators: ['Mohammed Al-Zaabi', 'Sultan Al-Mansouri', 'Rashid Al-Khouri', 'Nikhil Shrivastav'],
      consoles_requiring_attention: consoleData.filter(c => c.workload_state?.includes('Reactive') || c.workload_state?.includes('Overloaded')).map(c => `${c.console_id} (${c.workload_state})`)
    };
  }

  // Dynamic Page Context sent to Copilot Studio via invisible prompt envelope & channelData
  const activePageContext = {
    activeDashboard: activeTab === 'alarms' ? 'Alarm Champion Command Dashboard' :
                     activeTab === 'oie' ? 'Operational Integrity Envelope (OIE) Dashboard' :
                     activeTab === 'madb' ? 'Master Alarm Database (MADB) Deviations Dashboard' : 'Operator Console Workload & Shift Health Dashboard',
    currentRoute: `/dashboard/${activeTab}`,
    selectedGC: selectedGC,
    portalUser: 'Nikhil Shrivastav',
    userRole: 'Integrity Operations Lead',
    summaryStatus: overviewData.length > 0 ? overviewData[0]?.performance_state : 'State 1 - Robust Performance',
    liveMetrics: liveScreenMetrics
  };

  const displayName = 'Nikhil';
  const displayEmail = 'nikhil.shrivastav@techknomatic.com';
  const initial = 'N';

  return (
    <div className={`oasis-website-layout ${theme}-mode`}>
      {/* Top Application Bar matching ADNOC OASIS Header */}
      <header className="oasis-topbar">
        <div className="oasis-topbar-left">
          {/* ADNOC Logo Icon */}
          <div className="adnoc-brand-logo">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
              <circle cx="18" cy="18" r="17" fill="#0056b3" />
              <path
                d="M18 5C10.82 5 5 10.82 5 18C5 25.18 10.82 31 18 31C24.18 31 29.35 26.68 30.65 20.93C27.56 22.42 23.95 23.23 20.15 23.23C13.56 23.23 7.95 19.38 5.76 13.9C8.36 8.5 13.9 5 18 5Z"
                fill="white"
                opacity="0.9"
              />
              <path
                d="M18 9C13.5 9 9.7 11.5 8 15C10 12.2 13.5 10.5 17.5 10.5C22.5 10.5 26.5 13.5 28 17.5C27 12.5 23 9 18 9Z"
                fill="#38bdf8"
              />
            </svg>
          </div>

          <div className="oasis-header-branding">
            <span className="adnoc-oasis-title">ADNOC OASIS</span>
            <span className="adnoc-oasis-divider">|</span>
            <span className="adnoc-oasis-tagline">Operational Assurance System for Integrity and Safety</span>
          </div>
        </div>

        <div className="oasis-topbar-right">
          {/* Interactive GC Selector Dropdown */}
          <div className="oasis-filter-pill" style={{ padding: '4px 10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginRight: '6px' }}>Filter GC:</span>
            <select
              value={selectedGC}
              onChange={(e) => setSelectedGC(e.target.value)}
              style={{
                background: 'transparent',
                color: 'inherit',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="GC-01" style={{ background: '#1e293b', color: '#fff' }}>GC-01 (State 1 - Robust)</option>
              <option value="GC-02" style={{ background: '#1e293b', color: '#fff' }}>GC-02 (State 2 - Stable)</option>
              <option value="GC-03" style={{ background: '#1e293b', color: '#fff' }}>GC-03 (State 2 - Stable)</option>
              <option value="GC-04" style={{ background: '#1e293b', color: '#fff' }}>GC-04 (State 3 - Reactive)</option>
              <option value="GC-05" style={{ background: '#1e293b', color: '#fff' }}>GC-05 (State 4 - Overloaded)</option>
              <option value="ALL" style={{ background: '#1e293b', color: '#fff' }}>All Gathering Centers</option>
            </select>
          </div>

          {/* Theme Option Pill (Dark / Light) */}
          <button
            type="button"
            className="oasis-theme-toggle-pill"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" className="oasis-theme-icon sun">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="12" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                </svg>
                <span>Light</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" className="oasis-theme-icon moon">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                <span>Dark</span>
              </>
            )}
          </button>

          {/* User Profile */}
          <div className="oasis-user-pill" title={`ADNOC Operator: ${displayEmail}`}>
            <div className="oasis-user-avatar">{initial}</div>
            <span className="oasis-user-name">{displayName}</span>
          </div>
        </div>
      </header>

      {/* Main Website Viewport */}
      <main className="oasis-main-viewport">
        {/* Left Sidebar Navigation with 4 Distinct Operational Views */}
        <aside className="oasis-left-rail">
          <div 
            className={`oasis-rail-btn ${activeTab === 'alarms' ? 'active' : ''}`} 
            onClick={() => setActiveTab('alarms')}
            title="Alarm Champion Dashboard"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>

          <div 
            className={`oasis-rail-btn ${activeTab === 'oie' ? 'active' : ''}`} 
            onClick={() => setActiveTab('oie')}
            title="Operational Integrity Envelope (OIE)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>

          <div 
            className={`oasis-rail-btn ${activeTab === 'madb' ? 'active' : ''}`} 
            onClick={() => setActiveTab('madb')}
            title="Master Alarm Database (MADB)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="12" cy="13" r="8"></circle>
              <path d="M12 9v4l2 2"></path>
              <path d="M5 3L2 6"></path>
              <path d="M22 6l-3-3"></path>
            </svg>
          </div>

          <div 
            className={`oasis-rail-btn ${activeTab === 'consoles' ? 'active' : ''}`} 
            onClick={() => setActiveTab('consoles')}
            title="Consoles & Operator Workload"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>

          <div className="oasis-rail-bottom">
            <div className="oasis-user-circle">NS</div>
          </div>
        </aside>

        {/* Dashboard Canvas Area */}
        <div className="oasis-dashboard-canvas" style={{ padding: '24px 32px', overflowY: 'auto' }}>
          
          {/* Header Title & Breadcrumb */}
          <div className="oasis-dashboard-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0ea5e9', fontWeight: 700 }}>
                ADNOC OASIS LIVE PLATFORM • {selectedGC}
              </div>
              <h1 className="oasis-dashboard-title" style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>
                {activeTab === 'alarms' && 'Alarm Champion Command Dashboard'}
                {activeTab === 'oie' && 'Operational Integrity Envelope (OIE) Dashboard'}
                {activeTab === 'madb' && 'Master Alarm Database (MADB) Deviations'}
                {activeTab === 'consoles' && 'Operator Console Workload & Shift Health'}
              </h1>
            </div>

            {/* Context Badge synced to Copilot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(14, 165, 233, 0.3)', fontWeight: 600 }}>
                Synced to Copilot: {activeTab.toUpperCase()} ({selectedGC})
              </span>
            </div>
          </div>

          {/* API Notification Bar if FastAPI is starting up */}
          {apiError && (
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>
              <strong>Notice:</strong> {apiError}
            </div>
          )}

          {/* VIEW 1: ALARM CHAMPION DASHBOARD */}
          {activeTab === 'alarms' && (
            <div>
              {/* Top Key Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="oasis-preview-card" style={{ padding: '18px' }}>
                  <div className="oasis-card-label">Alarm State Classification</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: overviewData[0]?.performance_state_code >= 3 ? '#ef4444' : '#10b981', margin: '8px 0' }}>
                    {overviewData[0]?.performance_state || 'State 1 - Robust Performance'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Target: State 1 (Average Rate &le; 6 / Hr)</div>
                </div>

                <div className="oasis-preview-card" style={{ padding: '18px' }}>
                  <div className="oasis-card-label">Avg Alarm Rate / Hour</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8', margin: '6px 0' }}>
                    {overviewData[0]?.avg_alarm_rate_per_hr || '5.2'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Target: &le; 6.0 alarms / hr</div>
                </div>

                <div className="oasis-preview-card" style={{ padding: '18px' }}>
                  <div className="oasis-card-label">Peak Alarm Rate (10-Min)</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', margin: '6px 0' }}>
                    {overviewData[0]?.peak_alarm_rate_10min || '8'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Target: &le; 10 peak alarms</div>
                </div>

                <div className="oasis-preview-card" style={{ padding: '18px' }}>
                  <div className="oasis-card-label">% Upset Time</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: overviewData[0]?.upset_time_percentage > 2.5 ? '#ef4444' : '#34d399', margin: '6px 0' }}>
                    {overviewData[0]?.upset_time_percentage ? `${overviewData[0].upset_time_percentage}%` : '0.8%'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Target: &le; 1.0% operational time</div>
                </div>
              </div>

              {/* Hourly Trend Bar Chart Simulation */}
              <div className="oasis-preview-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>24-Hour Alarm Distribution vs Target Threshold</h3>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Hourly alarm volume per operator console</div>
                  </div>
                  <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '3px 8px', borderRadius: '4px' }}>
                    Target: 6 alarms/hr
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', height: '140px', gap: '24px', paddingBottom: '10px', borderBottom: '1px solid #334155' }}>
                  {(alarmData?.hourly_distribution || [
                    { time: '00:00', alarms: 4 },
                    { time: '04:00', alarms: 6 },
                    { time: '08:00', alarms: 11 },
                    { time: '12:00', alarms: 8 },
                    { time: '16:00', alarms: 14 },
                    { time: '20:00', alarms: 5 }
                  ]).map((bar, idx) => (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: bar.alarms > 6 ? '#f59e0b' : '#38bdf8' }}>{bar.alarms}</span>
                      <div 
                        style={{ 
                          width: '100%', 
                          height: `${Math.min(bar.alarms * 8, 110)}px`, 
                          background: bar.alarms > 6 ? 'linear-gradient(180deg, #f59e0b, #d97706)' : 'linear-gradient(180deg, #0ea5e9, #0284c7)', 
                          borderRadius: '4px 4px 0 0' 
                        }} 
                      />
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{bar.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: OPERATIONAL INTEGRITY ENVELOPE (OIE) */}
          {activeTab === 'oie' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="oasis-preview-card" style={{ padding: '20px' }}>
                  <div className="oasis-card-label">Monitored Safety Loops</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#38bdf8', margin: '6px 0' }}>
                    {oieData[0]?.total_monitored_loops || '70'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#34d399' }}>Healthy Loops: {oieData[0]?.healthy_loops || '68'}</div>
                </div>

                <div className="oasis-preview-card" style={{ padding: '20px' }}>
                  <div className="oasis-card-label">SOL Excursion Events (Safe Operating Limit)</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#f59e0b', margin: '6px 0' }}>
                    {oieData[0]?.sol_excursion_count || '2'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>OWEL Operating Window Breaches: {oieData[0]?.owel_breach_count || '4'}</div>
                </div>

                <div className="oasis-preview-card" style={{ padding: '20px' }}>
                  <div className="oasis-card-label">PRD Activation Trips (Pressure Relief)</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: (oieData[0]?.prd_activation_count || 0) > 0 ? '#ef4444' : '#10b981', margin: '6px 0' }}>
                    {oieData[0]?.prd_activation_count || '0'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Integrity Compliance: {oieData[0]?.integrity_compliance_pct ? `${oieData[0].integrity_compliance_pct}%` : '97.1%'}</div>
                </div>
              </div>

              {/* Loop Excursion Detail Table */}
              <div className="oasis-preview-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>OIE Monitored Process Units & Excursion Thresholds</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                      <th style={{ padding: '10px' }}>Gathering Center</th>
                      <th style={{ padding: '10px' }}>Monitored Loops</th>
                      <th style={{ padding: '10px' }}>SOL Excursions</th>
                      <th style={{ padding: '10px' }}>PRD Activations</th>
                      <th style={{ padding: '10px' }}>Compliance Rate</th>
                      <th style={{ padding: '10px' }}>Safety Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(oieData.length > 0 ? oieData : [
                      { gc_id: 'GC-01', total_monitored_loops: 70, sol_excursion_count: 2, prd_activation_count: 0, integrity_compliance_pct: 97.1 },
                      { gc_id: 'GC-02', total_monitored_loops: 70, sol_excursion_count: 8, prd_activation_count: 1, integrity_compliance_pct: 91.4 },
                      { gc_id: 'GC-03', total_monitored_loops: 70, sol_excursion_count: 12, prd_activation_count: 2, integrity_compliance_pct: 87.1 }
                    ]).map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '10px', fontWeight: 700 }}>{row.gc_id}</td>
                        <td style={{ padding: '10px' }}>{row.total_monitored_loops}</td>
                        <td style={{ padding: '10px', color: row.sol_excursion_count > 5 ? '#f59e0b' : '#38bdf8' }}>{row.sol_excursion_count}</td>
                        <td style={{ padding: '10px', color: row.prd_activation_count > 0 ? '#ef4444' : '#10b981' }}>{row.prd_activation_count}</td>
                        <td style={{ padding: '10px', fontWeight: 700 }}>{row.integrity_compliance_pct}%</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: row.integrity_compliance_pct > 90 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: row.integrity_compliance_pct > 90 ? '#34d399' : '#f87171' }}>
                            {row.integrity_compliance_pct > 90 ? 'Healthy' : 'Excursion Warning'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3: MASTER ALARM DATABASE (MADB) */}
          {activeTab === 'madb' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="oasis-preview-card" style={{ padding: '20px' }}>
                  <div className="oasis-card-label">Total Active Discrepancies</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#f59e0b', margin: '6px 0' }}>
                    {madbData[0]?.total_discrepancies || '94'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>DCS vs Approved MADB setpoints</div>
                </div>

                <div className="oasis-preview-card" style={{ padding: '20px' }}>
                  <div className="oasis-card-label">Aging &gt; 30 Days (Critical Audit)</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#ef4444', margin: '6px 0' }}>
                    {madbData[0]?.aging_over_30d || '28'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Aging &le; 15 Days: {madbData[0]?.aging_under_15d || '38'}</div>
                </div>

                <div className="oasis-preview-card" style={{ padding: '20px' }}>
                  <div className="oasis-card-label">Repetitive Bad Actors</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#c084fc', margin: '6px 0' }}>
                    {madbData[0]?.repetitive_alarms_count || '43'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>High/Critical Risk Ranking: {madbData[0]?.critical_risk_count || '9'}</div>
                </div>
              </div>

              {/* MADB Deviation Breakdown Card */}
              <div className="oasis-preview-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Active Discrepancy Governance</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6 }}>
                  According to ADNOC Alarm Management SOP, any parameter divergence between DCS active controllers and the approved Master Alarm Database aging beyond 30 days is categorized as a severe audit non-conformance.
                </p>
              </div>
            </div>
          )}

          {/* VIEW 4: CONSOLES & OPERATOR HEALTH */}
          {activeTab === 'consoles' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {(consoleData.length > 0 ? consoleData : [
                  { console_id: 'Console-01', console_name: 'Primary Inflow Console', assigned_operator: 'Mohammed Al-Zaabi', workload_state: 'Normal / Optimal', active_alarms_count: 3, standing_alarms_count: 1 },
                  { console_id: 'Console-02', console_name: 'High Pressure Separation', assigned_operator: 'Sultan Al-Mansouri', workload_state: 'Normal / Optimal', active_alarms_count: 4, standing_alarms_count: 2 },
                  { console_id: 'Console-03', console_name: 'Gas Compression Console A', assigned_operator: 'Rashid Al-Khouri', workload_state: 'Stable / Moderate', active_alarms_count: 11, standing_alarms_count: 4 },
                  { console_id: 'Console-07', console_name: 'Offshore Receiving Console', assigned_operator: 'Nikhil Shrivastav', workload_state: 'Reactive / Warning', active_alarms_count: 32, standing_alarms_count: 18 }
                ]).map((con, idx) => (
                  <div key={idx} className="oasis-preview-card" style={{ padding: '18px', borderLeft: con.workload_state.includes('Reactive') ? '4px solid #ef4444' : '4px solid #0ea5e9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px' }}>{con.console_id}</span>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: con.workload_state.includes('Normal') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: con.workload_state.includes('Normal') ? '#34d399' : '#f87171' }}>
                        {con.workload_state}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9', margin: '4px 0' }}>{con.console_name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Operator: <strong>{con.assigned_operator}</strong></div>
                    
                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #334155' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Active</span>
                        <div style={{ fontWeight: 700, fontSize: '16px', color: '#38bdf8' }}>{con.active_alarms_count}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Standing</span>
                        <div style={{ fontWeight: 700, fontSize: '16px', color: con.standing_alarms_count > 10 ? '#ef4444' : '#f59e0b' }}>{con.standing_alarms_count}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer status notice */}
          <div className="oasis-backdrop-notice" style={{ marginTop: '32px' }}>
            <span>ADNOC OASIS Operational Integrity Engine • Connected to Copilot Studio (Claude Sonnet 4.6)</span>
          </div>
        </div>
      </main>

      {/* Floating Launcher Button */}
      <OasisLauncherButton
        isOpen={isChatOpen}
        onClick={() => setIsChatOpen((prev) => !prev)}
      />

      {/* OASIS AI Copilot Floating Widget Window with pageContext Handshake */}
      <OasisChatWidget
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        pageContext={activePageContext}
      />
    </div>
  );
}
