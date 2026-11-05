/**
 * Speech Recognition Service (STT - Speech to Text)
 * Uses Azure Cognitive Services Speech SDK with seamless fallback to browser Web Speech API.
 */
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { AVATAR_CONFIG } from './avatarConfig';

class SpeechRecognitionService {
  constructor() {
    this.recognizer = null;
    this.nativeRecognition = null;
    this.isListening = false;
  }

  /**
   * Starts microphone recording and transcription
   * @param {function(string): void} onRecognizing - Called on partial live speech
   * @param {function(string): void} onRecognized - Called on final complete sentence
   * @param {function(string): void} onError - Called on error
   */
  async startListening(onRecognizing, onRecognized, onError) {
    if (this.isListening) {
      this.stopListening();
      return;
    }

    this.isListening = true;

    // 1. Try Azure Cognitive Services Speech SDK if configured
    if (AVATAR_CONFIG.isConfigured()) {
      try {
        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
          AVATAR_CONFIG.speechKey,
          AVATAR_CONFIG.speechRegion
        );
        speechConfig.speechRecognitionLanguage = AVATAR_CONFIG.speechVoice.startsWith('ar-')
          ? 'ar-AE'
          : 'en-US';

        const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        this.recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

        this.recognizer.recognizing = (s, e) => {
          if (e.result.text) onRecognizing(e.result.text);
        };

        this.recognizer.recognized = (s, e) => {
          if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech && e.result.text) {
            onRecognized(e.result.text);
            this.stopListening();
          }
        };

        this.recognizer.canceled = (s, e) => {
          if (e.errorDetails) onError(e.errorDetails);
          this.stopListening();
        };

        this.recognizer.startContinuousRecognitionAsync(
          () => console.log('Azure Speech Recognition started.'),
          (err) => {
            console.warn('Azure Speech Recognition error:', err);
            this.fallbackNativeRecognition(onRecognizing, onRecognized, onError);
          }
        );
        return;
      } catch (err) {
        console.warn('Failed to start Azure Speech Recognizer, using native fallback:', err);
      }
    }

    // 2. Fallback to Browser Native Web Speech API
    this.fallbackNativeRecognition(onRecognizing, onRecognized, onError);
  }

  fallbackNativeRecognition(onRecognizing, onRecognized, onError) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      this.isListening = false;
      onError('Microphone input is not supported in this browser.');
      return;
    }

    try {
      this.nativeRecognition = new SpeechRec();
      this.nativeRecognition.continuous = false;
      this.nativeRecognition.interimResults = true;
      this.nativeRecognition.lang = 'en-US';

      this.nativeRecognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            onRecognized(event.results[i][0].transcript);
            this.stopListening();
          } else {
            interim += event.results[i][0].transcript;
            onRecognizing(interim);
          }
        }
      };

      this.nativeRecognition.onerror = (event) => {
        onError(event.error || 'Speech recognition error');
        this.stopListening();
      };

      this.nativeRecognition.onend = () => {
        this.isListening = false;
      };

      this.nativeRecognition.start();
    } catch (err) {
      this.isListening = false;
      onError(err.message || 'Failed to start microphone');
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognizer) {
      try {
        this.recognizer.stopContinuousRecognitionAsync();
        this.recognizer.close();
      } catch (e) {
        // cleanup
      }
      this.recognizer = null;
    }

    if (this.nativeRecognition) {
      try {
        this.nativeRecognition.stop();
      } catch (e) {
        // cleanup
      }
      this.nativeRecognition = null;
    }
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
