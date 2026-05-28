// Web Speech API wrapper for Text-to-Speech (TTS) and Speech-to-Text (STT)

// 1. Text to Speech (TTS)
export const speakText = (text, rate = 0.9, voiceName = null) => {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject("Speech Synthesis not supported in this browser.");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate; // 0.8 to 1.2 is a good range for learners

    // Find and set voice if specified
    if (voiceName) {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    } else {
      // Fallback: search for a premium English voice
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(
        v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("David"))
      );
      if (premiumVoice) {
        utterance.voice = premiumVoice;
      }
    }

    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (e) => {
      reject(e);
    };

    window.speechSynthesis.speak(utterance);
  });
};

export const stopSpeaking = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const getAvailableVoices = () => {
  if (!window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith("en"));
};

// 2. Speech to Text (STT)
export class SpeechRecognizer {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.supported = false;
      return;
    }
    
    this.supported = true;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";
    
    this.isListening = false;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
    this.onStartCallback = null;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStartCallback) this.onStartCallback();
    };

    this.recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      if (this.onResultCallback) {
        this.onResultCallback(result, confidence);
      }
    };

    this.recognition.onerror = (event) => {
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };
  }

  start(onStart, onResult, onError, onEnd) {
    if (!this.supported) {
      if (onError) onError("Speech Recognition not supported in this browser.");
      return;
    }
    if (this.isListening) {
      return;
    }
    this.onStartCallback = onStart;
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onEndCallback = onEnd;

    try {
      this.recognition.start();
    } catch (e) {
      if (onError) onError(e.message);
    }
  }

  stop() {
    if (!this.supported || !this.isListening) return;
    try {
      this.recognition.stop();
    } catch (e) {
      console.error(e);
    }
  }
}
