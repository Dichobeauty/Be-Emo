/**
 * Speech synthesis engine for shouting / vocal reminders with echo-feedback suppression.
 */

import { AlertMode } from '../types';

let cachedVoices: SpeechSynthesisVoice[] = [];
let appSpeakingUntil = 0;
let isCurrentlySpeaking = false;
let lastSpokenAt = 0;

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  if (cachedVoices.length > 0) {
    return cachedVoices;
  }
  cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  getAvailableVoices();
}

/**
 * Returns true if the app is currently speaking or in the post-speech echo window.
 * This prevents the microphone and speech recognition from hearing the app's own voice
 * and triggering an infinite feedback loop!
 */
export function isAppCurrentlySpeaking(): boolean {
  return isCurrentlySpeaking || Date.now() < appSpeakingUntil;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
  isCurrentlySpeaking = false;
  appSpeakingUntil = 0;
}

interface SpeakOptions {
  text: string;
  style?: 'emphatic' | 'firm' | 'gentle' | 'whisper';
  mode?: AlertMode;
  voiceURI?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

export function speakAlert(options: SpeakOptions): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  // If in haptic_only mode, do not speak out loud
  if (options.mode === 'haptic_only') {
    return false;
  }

  const now = Date.now();
  // Cooldown protection: at least 1.8s between vocal shouts
  if (now - lastSpokenAt < 1800) {
    return false;
  }
  lastSpokenAt = now;

  // Mark app as speaking immediately to deafen the mic against self-audio
  isCurrentlySpeaking = true;
  // Estimate speaking duration (approx 1200ms + 700ms echo cooldown buffer)
  appSpeakingUntil = now + 2000;

  try {
    window.speechSynthesis.cancel();
  } catch {}

  const utterance = new SpeechSynthesisUtterance(options.text);

  // Pick voice
  const voices = getAvailableVoices();
  if (options.voiceURI) {
    const matched = voices.find((v) => v.voiceURI === options.voiceURI);
    if (matched) utterance.voice = matched;
  } else {
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    );
    if (preferred) utterance.voice = preferred;
  }

  // Determine vocal delivery style
  const isWhisperMode = options.mode === 'whisper' || options.style === 'whisper';

  if (isWhisperMode) {
    utterance.volume = 0.25;
    utterance.rate = 0.85;
    utterance.pitch = 0.9;
  } else if (options.style === 'emphatic') {
    utterance.volume = options.volume ?? 1.0;
    utterance.rate = options.rate ?? 1.1;
    utterance.pitch = options.pitch ?? 1.2;
  } else if (options.style === 'firm') {
    utterance.volume = options.volume ?? 0.95;
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;
  } else {
    utterance.volume = options.volume ?? 0.75;
    utterance.rate = options.rate ?? 0.95;
    utterance.pitch = options.pitch ?? 1.05;
  }

  utterance.onstart = () => {
    isCurrentlySpeaking = true;
    appSpeakingUntil = Date.now() + 2000;
    if (options.onStart) options.onStart();
  };

  const handleDone = () => {
    isCurrentlySpeaking = false;
    // Add 800ms cooldown for speaker reverberation to die down before re-enabling mic
    appSpeakingUntil = Date.now() + 800;
    if (options.onEnd) options.onEnd();
  };

  utterance.onend = handleDone;
  utterance.onerror = handleDone;

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch {}

  window.speechSynthesis.speak(utterance);
  return true;
}
