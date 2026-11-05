import React, { useEffect, useRef, useState } from 'react';
import { avatarService } from '../services/avatarService';
import { AVATAR_CONFIG } from '../services/avatarConfig';

export default function AvatarVideoPanel({ isSpeaking, onEndCall, isMuted, onToggleMute }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [avatarStatus, setAvatarStatus] = useState('idle'); // 'connecting' | 'connected' | 'speaking' | 'idle' | 'unconfigured' | 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [waveformBars, setWaveformBars] = useState([8, 14, 22, 12, 18, 28, 14, 9, 16, 24, 18, 10, 6, 12, 20, 8]);

  useEffect(() => {
    // Listen to status updates from AvatarService
    const unsubscribe = avatarService.onStatusChange((status, details) => {
      setAvatarStatus(status);
      if (details.message) setStatusMessage(details.message);
      if (details.error) setStatusMessage(details.error);
    });

    // Start Avatar Session if credentials configured
    if (AVATAR_CONFIG.isConfigured() && videoRef.current) {
      avatarService.startSession(videoRef.current, audioRef.current);
    } else {
      setAvatarStatus('unconfigured');
      setStatusMessage('Enter Azure Speech Key in Settings to stream live WebRTC avatar.');
    }

    return () => {
      unsubscribe();
      avatarService.stopSession();
    };
  }, []);

  // Animate waveform bars when speaking or active
  useEffect(() => {
    let animId;
    const animate = () => {
      if (isSpeaking || avatarStatus === 'speaking') {
        const raw = avatarService.getAudioWaveform();
        const bars = [];
        for (let i = 0; i < 16; i++) {
          const val = raw[i] ? Math.max(6, Math.min(32, raw[i] / 8)) : Math.floor(Math.random() * 26 + 6);
          bars.push(val);
        }
        setWaveformBars(bars);
      } else {
        setWaveformBars([4, 6, 8, 5, 7, 9, 6, 4, 5, 8, 6, 5, 4, 6, 7, 4]);
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking, avatarStatus]);

  return (
    <div className="oasis-avatar-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #091322 0%, #060b14 100%)',
      borderRadius: '16px',
      border: '1px solid #1e293b',
      overflow: 'hidden',
      position: 'relative',
      height: '100%',
      minHeight: '380px'
    }}>
      {/* Hidden Audio Element for WebRTC audio playback */}
      <audio ref={audioRef} autoPlay playsInline style={{ display: 'none' }} />

      {/* Main Avatar Video Frame */}
      <div style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#040711',
        overflow: 'hidden'
      }}>
        {/* Live WebRTC Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: avatarStatus === 'connected' || avatarStatus === 'speaking' ? 'block' : 'none'
          }}
        />

        {/* Realistic Persona Frame (Emirati Female Operator matching user screenshot 2) */}
        {(avatarStatus !== 'connected' || !videoRef.current?.srcObject) && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#070d18',
            overflow: 'hidden'
          }}>
            <img
              src="/avatar_operator.jpg"
              alt="ADNOC OASIS Operations Lead Avatar"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: isSpeaking ? 'brightness(1.08) contrast(1.05)' : 'brightness(0.96)',
                transform: isSpeaking ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onError={(e) => {
                // If image fails to load, gracefully hide img and show fallback SVG
                e.target.style.display = 'none';
                const fallback = document.getElementById('oasis-avatar-svg-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />

            {/* Fallback SVG if image not found */}
            <div
              id="oasis-avatar-svg-fallback"
              style={{
                display: 'none',
                position: 'absolute',
                inset: 0,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, #111e33 0%, #060a12 100%)',
                padding: '20px',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                border: isSpeaking ? '3px solid #38bdf8' : '2px solid rgba(56, 189, 248, 0.4)',
                boxShadow: isSpeaking ? '0 0 35px rgba(56, 189, 248, 0.5)' : '0 0 20px rgba(56, 189, 248, 0.2)',
                overflow: 'hidden',
                marginBottom: '14px',
              }}>
                <svg viewBox="0 0 160 160" width="160" height="160" fill="none">
                  <rect width="160" height="160" fill="#0b1322"/>
                  <path d="M40 160 C40 120, 60 90, 80 90 C100 90, 120 120, 120 160 Z" fill="#0f172a"/>
                  <ellipse cx="80" cy="72" rx="28" ry="34" fill="#fbd38d"/>
                  <path d="M50 72 C50 35, 62 25, 80 25 C98 25, 110 35, 110 72 C110 110, 95 125, 80 125 C65 125, 50 110, 50 72 Z" fill="#090d16" fillOpacity="0.95"/>
                  <ellipse cx="80" cy="74" rx="22" ry="28" fill="#fbd38d"/>
                  <ellipse cx="71" cy="70" rx="3.5" ry="2.2" fill="#1e293b"/>
                  <ellipse cx="89" cy="70" rx="3.5" ry="2.2" fill="#1e293b"/>
                  <path d="M73 88 Q80 94 87 88" stroke="#be123c" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                  <path d="M54 50 C54 30, 106 30, 106 50" stroke="#475569" strokeWidth="3.5" fill="none"/>
                  <rect x="52" y="60" width="6" height="16" rx="3" fill="#334155"/>
                  <rect x="102" y="60" width="6" height="16" rx="3" fill="#334155"/>
                  <path d="M55 72 L72 88" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="73" cy="89" r="3" fill="#38bdf8"/>
                </svg>
              </div>
            </div>

            {/* Subtle name badge overlay at bottom left */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(5, 10, 20, 0.75)',
              backdropFilter: 'blur(8px)',
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'left'
            }}>
              <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '12px' }}>Fatima Al-Nuaimi</span>
              <span style={{ color: '#38bdf8', fontSize: '10px' }}>ADNOC Operations Avatar</span>
            </div>
          </div>
        )}

        {/* Live Speaking Indicator Overlay */}
        {isSpeaking && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(14, 165, 233, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(14, 165, 233, 0.4)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffffff', animation: 'oasis-pulse 1s infinite' }}></span>
            <span>Avatar Speaking...</span>
          </div>
        )}
      </div>

      {/* Audio Waveform Visualizer & Action Bar (Matching Screenshot 2 exactly) */}
      <div style={{
        background: 'rgba(11, 19, 34, 0.95)',
        borderTop: '1px solid #1e293b',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Animated Waveform Visualizer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flex: 1, height: '36px' }}>
          {waveformBars.map((height, idx) => (
            <div
              key={idx}
              style={{
                width: '3.5px',
                height: `${height}px`,
                background: isSpeaking ? 'linear-gradient(180deg, #38bdf8, #0ea5e9)' : '#475569',
                borderRadius: '2px',
                transition: 'height 0.1s ease',
              }}
            />
          ))}
        </div>

        {/* Action Controls: End Call / Mute Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: isMuted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: isMuted ? '1px solid #ef4444' : '1px solid #334155',
              color: isMuted ? '#ef4444' : '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Red End Avatar Call Button as shown in screenshot */}
          <button
            type="button"
            onClick={onEndCall}
            title="End Video Avatar Call"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#ef4444',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(239, 68, 68, 0.4)'
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.996.996 0 0 1 0-1.41C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.39.39.39 1.02 0 1.41l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
