import { EnvironmentPreset, TriggerRule } from '../types';
import { HAPTIC_PATTERNS } from './haptics';

export const DEFAULT_RULES: TriggerRule[] = [
  {
    id: 'rule_loud_speech',
    name: 'Loud Voice Suppression',
    enabled: true,
    type: 'loud_speech',
    threshold: 72, // Decibels
    phrase: "That's not nice!",
    shoutStyle: 'emphatic',
    vibratePattern: HAPTIC_PATTERNS.alert_pulse,
    cooldownMs: 2800,
    description: 'Shouts aloud when your voice exceeds the ambient decorum threshold',
  },
  {
    id: 'rule_loud_laughter',
    name: 'Overexcited Laughter Guard',
    enabled: true,
    type: 'loud_laughter',
    threshold: 55, // Sensitivity 1-100
    phrase: 'You are losing control.',
    shoutStyle: 'firm',
    vibratePattern: HAPTIC_PATTERNS.double_tap,
    cooldownMs: 3200,
    description: 'Reminds you when laughing loudly with staccato harmonic spikes',
  },
  {
    id: 'rule_profanity_check',
    name: 'Profanity & Inappropriate Language Check',
    enabled: true,
    type: 'profanity_check',
    threshold: 70, // Strictness 1-100
    phrase: 'Language!',
    shoutStyle: 'emphatic',
    vibratePattern: HAPTIC_PATTERNS.alert_pulse,
    cooldownMs: 2200,
    description: 'Instantly shouts "Language!" and pulses haptic alert when curse words or inappropriate phrases are spoken',
    bannedWords: [],
  },
];

export const ENVIRONMENT_PRESETS: EnvironmentPreset[] = [
  {
    id: 'preset_office',
    name: 'Office & Meeting',
    description: 'Strict professional setting. Moderate acoustic thresholds and zero tolerance for foul language.',
    speechDbThreshold: 66,
    laughterThreshold: 65,
    motionThreshold: 80,
    suggestedMode: 'accountability',
  },
  {
    id: 'preset_dinner',
    name: 'Dinner & Restaurant',
    description: 'Balanced for social dining. Flags loud shouts, runaway laughter, and profane slips.',
    speechDbThreshold: 74,
    laughterThreshold: 55,
    motionThreshold: 70,
    suggestedMode: 'accountability',
  },
  {
    id: 'preset_library',
    name: 'Quiet Study & Library',
    description: 'Ultra-sensitive whisper discipline. Triggers early on noise or vocal disruptions.',
    speechDbThreshold: 52,
    laughterThreshold: 80,
    motionThreshold: 90,
    suggestedMode: 'whisper',
  },
  {
    id: 'preset_party',
    name: 'Party & Networking',
    description: 'Elevated room noise tolerance. Intervenes on extreme volume and blatant profanity.',
    speechDbThreshold: 83,
    laughterThreshold: 45,
    motionThreshold: 60,
    suggestedMode: 'accountability',
  },
];
