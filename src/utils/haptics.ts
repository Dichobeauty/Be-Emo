/**
 * Haptic feedback utility with hardware vibration, auditory thuds (for earbuds/headphones),
 * and screen visual ripple triggers.
 */

// Vibration patterns in ms [vibrate, pause, vibrate, ...]
export const HAPTIC_PATTERNS = {
  gentle_tap: [80],
  double_tap: [80, 50, 80],
  alert_pulse: [150, 80, 150],
  heartbeat: [90, 70, 90, 200, 90],
  gentle_hum: [180],
};

let sharedAudioCtx: AudioContext | null = null;

function getHapticAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        sharedAudioCtx = new AudioCtxClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Triggers subtle low-frequency acoustic haptic thump via speakers/earbuds
 * so users without phone vibration motors still experience a discreet tactile cue.
 */
export function playAuditoryHaptic(intensity: 'gentle' | 'medium' | 'firm' = 'gentle') {
  try {
    const ctx = getHapticAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Deep bass pitch that feels tactile like a phone vibration motor
    const startFreq = intensity === 'firm' ? 90 : intensity === 'medium' ? 75 : 60;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);

    const maxVolume = intensity === 'firm' ? 0.25 : intensity === 'medium' ? 0.15 : 0.08;
    gain.gain.setValueAtTime(maxVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Audio context may be restricted before user gesture
  }
}

/**
 * Performs gentle haptic feedback using navigator.vibrate, plus subtle earbud tactile tone
 */
export function triggerHapticVibration(
  pattern: number[] = HAPTIC_PATTERNS.gentle_tap,
  enableAuditoryCue = true
): boolean {
  let vibrated = false;

  // 1. Hardware vibration API
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      vibrated = navigator.vibrate(pattern);
    } catch {
      vibrated = false;
    }
  }

  // 2. Auditory haptic cue for desktop / earbuds
  if (enableAuditoryCue) {
    playAuditoryHaptic('gentle');
  }

  // 3. Dispatch visual haptic event for UI ripple
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auracheck:haptic', { detail: { pattern } }));
  }

  return vibrated;
}
