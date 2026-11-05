/**
 * Core type definitions for AuraCheck Composure Guardian
 */

export type AlertType = 'loud_speech' | 'loud_laughter' | 'profanity_check' | 'attention_motion' | 'manual_simulation';

export type AlertMode = 'accountability' | 'whisper' | 'haptic_only';

export interface TriggerRule {
  id: string;
  name: string;
  enabled: boolean;
  type: AlertType;
  threshold: number; // dB for sound, sensitivity/strictness score (1-100)
  phrase: string;
  shoutStyle: 'emphatic' | 'firm' | 'gentle' | 'whisper';
  vibratePattern: number[];
  cooldownMs: number;
  description: string;
  bannedWords?: string[];
}

export interface IncidentRecord {
  id: string;
  timestamp: number;
  type: AlertType;
  label: string;
  measuredValue: string;
  actionTaken: string;
  composureAtTime: number;
  dismissed?: boolean;
}

export interface EnvironmentPreset {
  id: string;
  name: string;
  description: string;
  speechDbThreshold: number;
  laughterThreshold: number; // 1-100 sensitivity
  motionThreshold: number; // 1-100 sensitivity
  suggestedMode: AlertMode;
}

export interface AudioMetrics {
  decibels: number;
  peakDecibels: number;
  frequencyBands: Uint8Array;
  isLaughterLikely: boolean;
  laughterConfidence: number;
}

export interface LanguageMetrics {
  lastSpokenTranscript: string;
  profanityCount: number;
  lastFlaggedWord: string | null;
  isSpeechRecognitionActive: boolean;
}

export interface MotionMetrics {
  accelerationMagnitude: number;
  motionScore: number; // 0-100
  isJerkyOrWaving: boolean;
}
