/**
 * Motion and agitation detector for identifying attention-drawing movements.
 */

export interface MotionAnalysisResult {
  linearAcceleration: number; // m/s^2 above gravity
  motionScore: number; // 0 to 100
  isAttentionDrawing: boolean;
  source: 'device_sensor' | 'simulation' | 'webcam' | 'idle';
}

export class MotionComposureAnalyzer {
  private isListening = false;
  private currentAcceleration = 0;
  private recentScores: number[] = [];
  private lastSampleTime = 0;
  private motionScore = 0;

  private handleMotion = (event: DeviceMotionEvent) => {
    const acc = event.acceleration || event.accelerationIncludingGravity;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;

    const totalMag = Math.sqrt(x * x + y * y + z * z);
    // Remove gravity baseline (~9.8 m/s^2) if using accelerationIncludingGravity
    const rawLinear = event.acceleration ? totalMag : Math.abs(totalMag - 9.8);
    this.currentAcceleration = Math.max(0, rawLinear);

    // Compute dynamic motion score (0-100)
    // 0 = resting, 15 = normal walking/shifting, 40+ = rapid gesturing, 70+ = aggressive agitation/flailing
    const instantaneousScore = Math.min(100, Math.round(this.currentAcceleration * 12));
    this.recentScores.push(instantaneousScore);
    if (this.recentScores.length > 10) {
      this.recentScores.shift();
    }

    const avg = this.recentScores.reduce((a, b) => a + b, 0) / this.recentScores.length;
    this.motionScore = Math.round(avg);
    this.lastSampleTime = performance.now();
  };

  async requestPermissionAndStart(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check for iOS 13+ permission request
    const devMotionEvent = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof devMotionEvent?.requestPermission === 'function') {
      try {
        const response = await devMotionEvent.requestPermission();
        if (response !== 'granted') {
          return false;
        }
      } catch (err) {
        console.warn('DeviceMotion permission failed:', err);
        return false;
      }
    }

    if ('ondevicemotion' in window) {
      window.addEventListener('devicemotion', this.handleMotion);
      this.isListening = true;
      return true;
    }

    return false;
  }

  stop() {
    if (typeof window !== 'undefined' && this.isListening) {
      window.removeEventListener('devicemotion', this.handleMotion);
      this.isListening = false;
    }
  }

  // Allow manual inject (for testing or simulation)
  injectSimulationSpike(intensity = 85) {
    this.currentAcceleration = intensity / 10;
    this.motionScore = intensity;
    this.lastSampleTime = performance.now();
  }

  analyze(motionSensitivity = 65): MotionAnalysisResult {
    // Decay score if no events recently (e.g. device is resting)
    const now = performance.now();
    if (now - this.lastSampleTime > 400 && this.motionScore > 0) {
      this.motionScore = Math.max(0, this.motionScore - 8);
      this.currentAcceleration = Math.max(0, this.currentAcceleration - 0.5);
    }

    // Sensitivity threshold: 100 sensitivity -> threshold score 30; 50 sensitivity -> threshold 60
    const thresholdScore = Math.max(25, 105 - motionSensitivity);
    const isAttentionDrawing = this.motionScore >= thresholdScore;

    return {
      linearAcceleration: Number(this.currentAcceleration.toFixed(2)),
      motionScore: this.motionScore,
      isAttentionDrawing,
      source: this.isListening ? 'device_sensor' : this.motionScore > 0 ? 'simulation' : 'idle',
    };
  }
}
