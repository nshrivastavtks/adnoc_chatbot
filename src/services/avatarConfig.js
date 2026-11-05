/**
 * Azure AI Speech & Avatar Configuration Manager
 * Persists credentials in localStorage and supports environment variables.
 */

const STORAGE_KEYS = {
  SPEECH_KEY: 'nexusai_azure_speech_key',
  SPEECH_REGION: 'nexusai_azure_speech_region',
  AVATAR_CHARACTER: 'nexusai_avatar_character',
  AVATAR_STYLE: 'nexusai_avatar_style',
  SPEECH_VOICE: 'nexusai_speech_voice',
  BG_MODE: 'nexusai_avatar_bg_mode',
};

export const AVATAR_CONFIG = {
  get speechKey() {
    return (
      localStorage.getItem(STORAGE_KEYS.SPEECH_KEY) ||
      import.meta.env.VITE_AZURE_SPEECH_KEY ||
      ''
    );
  },
  set speechKey(val) {
    if (val) localStorage.setItem(STORAGE_KEYS.SPEECH_KEY, val.trim());
    else localStorage.removeItem(STORAGE_KEYS.SPEECH_KEY);
  },

  get speechRegion() {
    return (
      localStorage.getItem(STORAGE_KEYS.SPEECH_REGION) ||
      import.meta.env.VITE_AZURE_SPEECH_REGION ||
      'westeurope'
    );
  },
  set speechRegion(val) {
    if (val) localStorage.setItem(STORAGE_KEYS.SPEECH_REGION, val.trim());
    else localStorage.removeItem(STORAGE_KEYS.SPEECH_REGION);
  },

  get avatarCharacter() {
    return (
      localStorage.getItem(STORAGE_KEYS.AVATAR_CHARACTER) ||
      import.meta.env.VITE_AVATAR_CHARACTER ||
      'lisa'
    );
  },
  set avatarCharacter(val) {
    if (val) localStorage.setItem(STORAGE_KEYS.AVATAR_CHARACTER, val.trim());
    else localStorage.removeItem(STORAGE_KEYS.AVATAR_CHARACTER);
  },

  get avatarStyle() {
    return (
      localStorage.getItem(STORAGE_KEYS.AVATAR_STYLE) ||
      import.meta.env.VITE_AVATAR_STYLE ||
      'casual'
    );
  },
  set avatarStyle(val) {
    if (val) localStorage.setItem(STORAGE_KEYS.AVATAR_STYLE, val.trim());
    else localStorage.removeItem(STORAGE_KEYS.AVATAR_STYLE);
  },

  get speechVoice() {
    return (
      localStorage.getItem(STORAGE_KEYS.SPEECH_VOICE) ||
      import.meta.env.VITE_SPEECH_VOICE ||
      'en-US-JennyNeural'
    );
  },
  set speechVoice(val) {
    if (val) localStorage.setItem(STORAGE_KEYS.SPEECH_VOICE, val.trim());
    else localStorage.removeItem(STORAGE_KEYS.SPEECH_VOICE);
  },

  get backgroundMode() {
    return localStorage.getItem(STORAGE_KEYS.BG_MODE) || 'transparent';
  },
  set backgroundMode(val) {
    if (val) localStorage.setItem(STORAGE_KEYS.BG_MODE, val);
    else localStorage.removeItem(STORAGE_KEYS.BG_MODE);
  },

  isConfigured() {
    return Boolean(this.speechKey && this.speechRegion);
  },
};
