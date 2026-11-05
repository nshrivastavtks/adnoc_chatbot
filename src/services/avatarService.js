/**
 * Azure AI Speech Real-Time Avatar Service (WebRTC)
 * Integrates Microsoft Cognitive Services Speech SDK AvatarSynthesizer with WebRTC RTCPeerConnection.
 */
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { AVATAR_CONFIG } from './avatarConfig';

class AvatarService {
  constructor() {
    this.peerConnection = null;
    this.avatarSynthesizer = null;
    this.speechConfig = null;
    this.avatarConfig = null;
    this.isConnected = false;
    this.isSpeaking = false;
    this.statusListeners = new Set();
    this.audioStream = null;
    this.audioContext = null;
    this.analyser = null;
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  notifyStatus(status, details = {}) {
    this.statusListeners.forEach((cb) => {
      try {
        cb(status, details);
      } catch (err) {
        console.error('Avatar status listener error:', err);
      }
    });
  }

  /**
   * Initializes WebRTC connection and starts the Avatar session with Azure AI Speech
   * @param {HTMLVideoElement} videoElement
   * @param {HTMLAudioElement} [audioElement]
   */
  async startSession(videoElement, audioElement = null) {
    if (!AVATAR_CONFIG.isConfigured()) {
      this.notifyStatus('unconfigured', {
        message: 'Azure Speech credentials are not configured in Settings.',
      });
      return false;
    }

    try {
      this.notifyStatus('connecting', { message: 'Initializing WebRTC peer connection...' });

      // Clean up any existing connection
      this.stopSession();

      // 1. Create WebRTC Peer Connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      // 2. Handle remote video & audio tracks
      this.peerConnection.ontrack = (event) => {
        if (event.track.kind === 'video' && videoElement) {
          videoElement.srcObject = event.streams[0];
          videoElement.play().catch((e) => console.warn('Video auto-play interrupted:', e));
        }

        if (event.track.kind === 'audio') {
          if (audioElement) {
            audioElement.srcObject = event.streams[0];
            audioElement.play().catch((e) => console.warn('Audio auto-play interrupted:', e));
          }
          this.initAudioAnalyser(event.streams[0]);
        }
      };

      // 3. Request send/recv transceivers for WebRTC media
      this.peerConnection.addTransceiver('video', { direction: 'sendrecv' });
      this.peerConnection.addTransceiver('audio', { direction: 'sendrecv' });

      // 4. Configure Azure Speech & Avatar
      this.speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        AVATAR_CONFIG.speechKey,
        AVATAR_CONFIG.speechRegion
      );
      this.speechConfig.speechSynthesisVoiceName = AVATAR_CONFIG.speechVoice;

      const videoFormat = new SpeechSDK.AvatarVideoFormat();
      this.avatarConfig = new SpeechSDK.AvatarConfig(
        AVATAR_CONFIG.avatarCharacter,
        AVATAR_CONFIG.avatarStyle,
        videoFormat
      );

      // Transparent or color background
      if (AVATAR_CONFIG.backgroundMode === 'transparent') {
        this.avatarConfig.backgroundColor = '#00000000';
      } else {
        this.avatarConfig.backgroundColor = '#0b1120';
      }

      // 5. Create AvatarSynthesizer & initiate handshake
      this.avatarSynthesizer = new SpeechSDK.AvatarSynthesizer(
        this.speechConfig,
        this.avatarConfig
      );

      // Event listeners on Avatar Synthesizer
      this.avatarSynthesizer.avatarEventReceived = (s, e) => {
        if (e.description === 'SynthesizingStarted') {
          this.isSpeaking = true;
          this.notifyStatus('speaking');
        } else if (e.description === 'SynthesizingCompleted') {
          this.isSpeaking = false;
          this.notifyStatus('idle');
        }
      };

      // Start Avatar session over WebRTC
      await this.avatarSynthesizer.startAvatarAsync(this.peerConnection);
      this.isConnected = true;
      this.notifyStatus('connected', { message: 'Avatar connected & live' });
      return true;
    } catch (err) {
      console.error('Failed to start Azure Avatar session:', err);
      this.isConnected = false;
      this.notifyStatus('error', { error: err.message || 'Avatar connection failed' });
      return false;
    }
  }

  /**
   * Initializes Web Audio Analyser for live waveform visualization
   */
  initAudioAnalyser(mediaStream) {
    try {
      this.audioStream = mediaStream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);
    } catch (e) {
      console.warn('Audio analyser initialization skipped:', e);
    }
  }

  /**
   * Returns audio frequency waveform data for the visualizer
   */
  getAudioWaveform() {
    if (!this.analyser) return new Uint8Array(16);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /**
   * Cleans raw bot responses (removing markdown tables, code blocks, citations) into spoken text
   */
  cleanTextForSpeech(rawText) {
    if (!rawText) return '';
    let clean = rawText
      .replace(/```[\s\S]*?```/g, '') // remove code blocks
      .replace(/<think>[\s\S]*?<\/think>/gi, '') // remove think blocks
      .replace(/\|[\s\S]*?\|/g, '') // remove markdown tables
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // replace markdown links with text
      .replace(/[#*_~`>-]/g, '') // remove markdown formatting symbols
      .replace(/•/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return clean;
  }

  /**
   * Dispatches text to Azure AvatarSynthesizer to vocalize and animate lips
   */
  async speakText(text) {
    const spokenText = this.cleanTextForSpeech(text);
    if (!spokenText) return;

    if (!this.isConnected || !this.avatarSynthesizer) {
      console.warn('Avatar is not currently connected. Speech skipped.');
      return;
    }

    try {
      this.isSpeaking = true;
      this.notifyStatus('speaking');
      const result = await this.avatarSynthesizer.speakTextAsync(spokenText);
      this.isSpeaking = false;
      this.notifyStatus('idle');
      return result;
    } catch (err) {
      console.error('Avatar speech synthesis error:', err);
      this.isSpeaking = false;
      this.notifyStatus('idle');
    }
  }

  /**
   * Stops avatar speech and closes WebRTC session
   */
  stopSession() {
    this.isSpeaking = false;
    this.isConnected = false;

    if (this.avatarSynthesizer) {
      try {
        this.avatarSynthesizer.close();
      } catch (e) {
        // cleanup
      }
      this.avatarSynthesizer = null;
    }

    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch (e) {
        // cleanup
      }
      this.peerConnection = null;
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {
        // cleanup
      }
      this.audioContext = null;
    }

    this.notifyStatus('disconnected');
  }
}

export const avatarService = new AvatarService();
