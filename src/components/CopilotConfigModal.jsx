import React, { useState } from 'react';
import { COPILOT_CONFIG } from '../services/copilotService';
import { AVATAR_CONFIG } from '../services/avatarConfig';
import { useTheme } from '../context/ThemeContext';

export default function CopilotConfigModal({ isOpen, onClose, onSave }) {
  const { theme, setTheme } = useTheme();

  // Active Tab: 'copilot' | 'avatar' | 'appearance'
  const [activeTab, setActiveTab] = useState('copilot');

  // Copilot Direct Line state
  const [tokenEndpoint, setTokenEndpoint] = useState(COPILOT_CONFIG.tokenEndpoint || '');
  const [directLineSecret, setDirectLineSecret] = useState(COPILOT_CONFIG.directLineSecret || '');
  const [showSecret, setShowSecret] = useState(false);

  // Azure AI Speech & Avatar state
  const [speechKey, setSpeechKey] = useState(AVATAR_CONFIG.speechKey || '');
  const [speechRegion, setSpeechRegion] = useState(AVATAR_CONFIG.speechRegion || 'westeurope');
  const [avatarCharacter, setAvatarCharacter] = useState(AVATAR_CONFIG.avatarCharacter || 'lisa');
  const [avatarStyle, setAvatarStyle] = useState(AVATAR_CONFIG.avatarStyle || 'casual');
  const [speechVoice, setSpeechVoice] = useState(AVATAR_CONFIG.speechVoice || 'en-US-JennyNeural');
  const [backgroundMode, setBackgroundMode] = useState(AVATAR_CONFIG.backgroundMode || 'transparent');
  const [showSpeechKey, setShowSpeechKey] = useState(false);

  const [status, setStatus] = useState('');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();

    // 1. Save Copilot Studio settings
    if (onSave) {
      onSave({
        tokenEndpoint: tokenEndpoint.trim(),
        directLineSecret: directLineSecret.trim(),
      });
    }

    // 2. Save Azure Avatar & Speech settings to AVATAR_CONFIG
    AVATAR_CONFIG.speechKey = speechKey.trim();
    AVATAR_CONFIG.speechRegion = speechRegion.trim();
    AVATAR_CONFIG.avatarCharacter = avatarCharacter.trim();
    AVATAR_CONFIG.avatarStyle = avatarStyle.trim();
    AVATAR_CONFIG.speechVoice = speechVoice.trim();
    AVATAR_CONFIG.backgroundMode = backgroundMode;

    setStatus('All connection & avatar settings saved successfully!');
    setTimeout(() => {
      setStatus('');
      onClose();
    }, 1000);
  };

  return (
    <div className="oasis-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="oasis-modal-card" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="oasis-modal-header">
          <div className="oasis-modal-header-left">
            <div className="oasis-modal-icon-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <div>
              <h2 className="oasis-modal-title">Copilot &amp; Avatar Settings</h2>
              <div className="oasis-modal-subtitle">ADNOC OASIS Intelligent Assistant Configuration</div>
            </div>
          </div>
          <button
            type="button"
            className="oasis-modal-close-btn"
            onClick={onClose}
            aria-label="Close settings"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 24px 0 24px', borderBottom: '1px solid var(--border-color, #334155)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('copilot')}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'copilot' ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeTab === 'copilot' ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🤖 Copilot Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('avatar')}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'avatar' ? '2px solid #c084fc' : '2px solid transparent',
              color: activeTab === 'avatar' ? '#c084fc' : '#94a3b8',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>📹 Azure Avatar &amp; Voice</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'appearance' ? '2px solid #10b981' : '2px solid transparent',
              color: activeTab === 'appearance' ? '#10b981' : '#94a3b8',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🎨 Appearance</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="oasis-modal-form" style={{ maxHeight: '65vh', overflowY: 'auto', padding: '20px 24px' }}>
          
          {/* TAB 1: COPILOT STUDIO (DIRECT LINE) */}
          {activeTab === 'copilot' && (
            <div>
              <div className="oasis-modal-notice">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="oasis-notice-icon">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>
                  Connect to your Microsoft Copilot Studio agent using the <strong>Direct Line Secret Key</strong> or <strong>Token Endpoint</strong>.
                </span>
              </div>

              {/* Direct Line Secret Key */}
              <div className="oasis-form-field">
                <div className="oasis-field-label-row">
                  <label htmlFor="copilot-directline-secret" className="oasis-field-label">
                    Direct Line Secret Key
                  </label>
                  <span className="oasis-recommended-tag">Recommended</span>
                </div>
                <div className="oasis-input-wrapper with-icon">
                  <input
                    id="copilot-directline-secret"
                    type={showSecret ? 'text' : 'password'}
                    className="oasis-modal-text-input"
                    placeholder="Enter Azure Bot / Copilot Studio Direct Line Secret..."
                    value={directLineSecret}
                    onChange={(e) => setDirectLineSecret(e.target.value)}
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    className="oasis-input-icon-btn"
                    onClick={() => setShowSecret(!showSecret)}
                    title={showSecret ? 'Hide secret' : 'Show secret'}
                  >
                    {showSecret ? '👁️' : '🔒'}
                  </button>
                </div>
                <span className="oasis-field-help">
                  Copilot Studio: <em>Settings &gt; Channels &gt; Direct Line &gt; Secret Keys</em>
                </span>
              </div>

              {/* Token Endpoint URL (Optional) */}
              <div className="oasis-form-field" style={{ marginTop: '16px' }}>
                <div className="oasis-field-label-row">
                  <label htmlFor="copilot-token-endpoint" className="oasis-field-label">
                    Alternative: Token Endpoint URL
                  </label>
                </div>
                <div className="oasis-input-wrapper">
                  <input
                    id="copilot-token-endpoint"
                    type="text"
                    className="oasis-modal-text-input"
                    placeholder="https://...api.botframework.com/powervirtualagents/.../directline/token?api-version=..."
                    value={tokenEndpoint}
                    onChange={(e) => setTokenEndpoint(e.target.value)}
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>
                <span className="oasis-field-help">
                  Copilot Studio: <em>Settings &gt; Channels &gt; Mobile app &gt; Token Endpoint</em>
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: AZURE AI SPEECH & AVATAR */}
          {activeTab === 'avatar' && (
            <div>
              <div className="oasis-modal-notice" style={{ background: 'rgba(192, 132, 252, 0.12)', borderColor: 'rgba(192, 132, 252, 0.3)' }}>
                <span style={{ fontSize: '13px' }}>
                  ⚡ <strong>Azure AI Real-Time Avatar &amp; Voice:</strong> Powers the photorealistic digital avatar video stream over WebRTC and microphone speech recognition.
                </span>
              </div>

              {/* Azure Speech Subscription Key */}
              <div className="oasis-form-field">
                <div className="oasis-field-label-row">
                  <label className="oasis-field-label">Azure Speech API Key (Subscription Key)</label>
                  <span className="oasis-recommended-tag" style={{ background: '#7c3aed' }}>Required for Video Avatar</span>
                </div>
                <div className="oasis-input-wrapper with-icon">
                  <input
                    type={showSpeechKey ? 'text' : 'password'}
                    className="oasis-modal-text-input"
                    placeholder="Enter Azure Cognitive Services Speech Key..."
                    value={speechKey}
                    onChange={(e) => setSpeechKey(e.target.value)}
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    className="oasis-input-icon-btn"
                    onClick={() => setShowSpeechKey(!showSpeechKey)}
                  >
                    {showSpeechKey ? '👁️' : '🔒'}
                  </button>
                </div>
                <span className="oasis-field-help">
                  Azure Portal &gt; Speech Service (S0 tier) &gt; <em>Keys and Endpoint &gt; Key 1</em>
                </span>
              </div>

              {/* Azure Speech Region */}
              <div className="oasis-form-field" style={{ marginTop: '16px' }}>
                <label className="oasis-field-label">Speech Service Region</label>
                <select
                  className="oasis-modal-text-input"
                  value={speechRegion}
                  onChange={(e) => setSpeechRegion(e.target.value)}
                  style={{ background: 'var(--bg-secondary, #1e293b)', color: 'inherit' }}
                >
                  <option value="westeurope">westeurope (West Europe - Recommended for Gulf/UAE)</option>
                  <option value="eastus2">eastus2 (East US 2)</option>
                  <option value="southeastasia">southeastasia (Southeast Asia)</option>
                  <option value="northeurope">northeurope (North Europe)</option>
                  <option value="swedencentral">swedencentral (Sweden Central)</option>
                  <option value="southcentralus">southcentralus (South Central US)</option>
                </select>
                <span className="oasis-field-help">
                  Real-time avatar synthesis is hosted in selected Azure S0 regions.
                </span>
              </div>

              {/* Avatar Character & Style Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div className="oasis-form-field">
                  <label className="oasis-field-label">Avatar Character</label>
                  <input
                    type="text"
                    className="oasis-modal-text-input"
                    placeholder="e.g. lisa, meg, or custom avatar"
                    value={avatarCharacter}
                    onChange={(e) => setAvatarCharacter(e.target.value)}
                  />
                  <span className="oasis-field-help">Default: <code>lisa</code> or custom</span>
                </div>

                <div className="oasis-form-field">
                  <label className="oasis-field-label">Avatar Style</label>
                  <input
                    type="text"
                    className="oasis-modal-text-input"
                    placeholder="casual, technical, business"
                    value={avatarStyle}
                    onChange={(e) => setAvatarStyle(e.target.value)}
                  />
                  <span className="oasis-field-help">Default: <code>casual</code></span>
                </div>
              </div>

              {/* Speech Voice */}
              <div className="oasis-form-field" style={{ marginTop: '16px' }}>
                <label className="oasis-field-label">Text-to-Speech Neural Voice</label>
                <select
                  className="oasis-modal-text-input"
                  value={speechVoice}
                  onChange={(e) => setSpeechVoice(e.target.value)}
                  style={{ background: 'var(--bg-secondary, #1e293b)', color: 'inherit' }}
                >
                  <option value="en-US-JennyNeural">en-US-JennyNeural (English US - Natural Assistant)</option>
                  <option value="en-US-AvaNeural">en-US-AvaNeural (English US - Friendly)</option>
                  <option value="ar-AE-FatimaNeural">ar-AE-FatimaNeural (Arabic UAE - Emirati Female)</option>
                  <option value="en-AE-HamdanNeural">en-AE-HamdanNeural (English UAE - Professional)</option>
                  <option value="en-US-AndrewNeural">en-US-AndrewNeural (English US - Male)</option>
                </select>
                <span className="oasis-field-help">Voice used for vocal synthesis and lip-synchronization.</span>
              </div>

              {/* Background Mode */}
              <div className="oasis-form-field" style={{ marginTop: '16px' }}>
                <label className="oasis-field-label">Avatar Video Canvas Background</label>
                <select
                  className="oasis-modal-text-input"
                  value={backgroundMode}
                  onChange={(e) => setBackgroundMode(e.target.value)}
                  style={{ background: 'var(--bg-secondary, #1e293b)', color: 'inherit' }}
                >
                  <option value="transparent">Transparent Background (Alpha channel)</option>
                  <option value="dark">Dark Slate Background (#0b1120)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: THEME / APPEARANCE */}
          {activeTab === 'appearance' && (
            <div>
              <div className="oasis-form-field">
                <div className="oasis-field-label-row">
                  <label className="oasis-field-label">Interface Appearance Theme</label>
                  <span className="oasis-theme-current-label">
                    Active: <strong>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong>
                  </span>
                </div>
                <div className="oasis-theme-choice-row">
                  <button
                    type="button"
                    className={`oasis-theme-choice-btn ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    <span>🌙 Dark Theme</span>
                  </button>
                  <button
                    type="button"
                    className={`oasis-theme-choice-btn ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    <span>☀️ Light Theme</span>
                  </button>
                </div>
                <span className="oasis-field-help">
                  Applies instantly across the dashboard and the AI Copilot window.
                </span>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {status && (
            <div className="oasis-modal-success-banner" style={{ marginTop: '20px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>{status}</span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="oasis-modal-footer" style={{ marginTop: '24px' }}>
            <button type="button" className="oasis-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="oasis-btn-primary">
              Save All Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
