/**
 * Real-time audio analyzer for decibel measurement and laughter burst detection.
 */

export interface AudioAnalysisResult {
  decibels: number;
  peakDecibels: number;
  volumeNormalized: number; // 0 to 1
  isLoudSpeech: boolean;
  isLaughter: boolean;
  laughterConfidence: number; // 0 to 1
  frequencies: Uint8Array;
}

export class AudioComposureAnalyzer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private timeData: Uint8Array | null = null;
  private freqData: Uint8Array | null = null;
  
  // History for burst / rhythm detection (laughter has ~4-6 Hz staccato bursts)
  private energyHistory: number[] = [];
  private historySize = 30;
  private peakHold = 0;
  private lastPeakTime = 0;

  async start(): Promise<boolean> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      const source = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.35;

      source.connect(this.analyser);

      this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

      return true;
    } catch (err) {
      console.warn('Microphone access denied or audio initialization failed:', err);
      return false;
    }
  }

  stop() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.analyser = null;
  }

  analyze(speechDbThreshold = 72, laughterSensitivity = 60): AudioAnalysisResult {
    if (!this.analyser || !this.timeData || !this.freqData) {
      return {
        decibels: 0,
        peakDecibels: 0,
        volumeNormalized: 0,
        isLoudSpeech: false,
        isLaughter: false,
        laughterConfidence: 0,
        frequencies: new Uint8Array(0),
      };
    }

    (this.analyser as unknown as { getByteTimeDomainData: (arr: Uint8Array) => void }).getByteTimeDomainData(this.timeData);
    (this.analyser as unknown as { getByteFrequencyData: (arr: Uint8Array) => void }).getByteFrequencyData(this.freqData);

    // 1. Calculate RMS volume
    let sumSquares = 0;
    for (let i = 0; i < this.timeData.length; i++) {
      const normalized = (this.timeData[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / this.timeData.length);

    // Approximate dB SPL: 20 to 105 dB dynamic range
    // 0 RMS -> ~20 dB background room noise floor
    const rawDb = 20 + Math.min(85, Math.round(rms * 120 + (rms > 0.02 ? 25 : 0)));
    const decibels = Math.max(20, Math.min(105, rawDb));

    // Peak hold calculation
    const now = performance.now();
    if (decibels > this.peakHold || now - this.lastPeakTime > 1800) {
      this.peakHold = decibels;
      this.lastPeakTime = now;
    } else {
      this.peakHold = Math.max(decibels, this.peakHold - 0.4);
    }

    // Normalized volume: 0 to 1
    const volumeNormalized = Math.min(1, Math.max(0, (decibels - 30) / 65));

    // 2. Frequency breakdown
    // With fftSize 512 & 44.1kHz sample rate, each bin is ~86 Hz
    // Low band (vocal fundamental 80-350 Hz): bins 1-4
    // Mid speech band (350-1400 Hz): bins 4-16
    // High-mid laughter harmonics (1400-3600 Hz): bins 16-42
    let lowEnergy = 0;
    let midEnergy = 0;
    let highMidEnergy = 0;

    for (let i = 1; i <= 4 && i < this.freqData.length; i++) {
      lowEnergy += this.freqData[i];
    }
    for (let i = 4; i <= 16 && i < this.freqData.length; i++) {
      midEnergy += this.freqData[i];
    }
    for (let i = 16; i <= 42 && i < this.freqData.length; i++) {
      highMidEnergy += this.freqData[i];
    }

    const avgHighMid = highMidEnergy / 26;
    const avgLow = Math.max(1, lowEnergy / 4);

    // Track energy bursts over time
    this.energyHistory.push(avgHighMid);
    if (this.energyHistory.length > this.historySize) {
      this.energyHistory.shift();
    }

    // 3. Laughter pattern detection:
    // Laughter characteristics:
    // - Strong high-mid vocal harmonics (high ratio of highMid / low)
    // - High burstiness / variance across recent 150-300ms (staccato "ha-ha-ha" pulses)
    // - Sufficient loudness (usually > 62 dB)
    let burstVariance = 0;
    if (this.energyHistory.length >= 8) {
      const mean = this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length;
      burstVariance = this.energyHistory.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / this.energyHistory.length;
    }

    // Laughter score calculation
    const harmonicRatio = avgHighMid / avgLow;
    const loudnessFactor = Math.max(0, (decibels - 58) / 35);
    const burstFactor = Math.min(1, burstVariance / 400);

    // Combined laughter confidence (0 to 1)
    let rawLaughterConfidence = 0;
    if (decibels >= 58 && avgHighMid > 35) {
      rawLaughterConfidence = (burstFactor * 0.45) + (harmonicRatio * 0.25) + (loudnessFactor * 0.3);
    }
    const laughterConfidence = Math.min(1, Math.max(0, rawLaughterConfidence));

    // Threshold sensitivity: laughterSensitivity is 1-100 (default 60 -> threshold ~0.45)
    const laughterDetectionThreshold = Math.max(0.2, (100 - laughterSensitivity) / 100 * 0.8);
    const isLaughter = laughterConfidence >= laughterDetectionThreshold && decibels >= 62;

    const isLoudSpeech = decibels >= speechDbThreshold;

    return {
      decibels,
      peakDecibels: Math.round(this.peakHold),
      volumeNormalized,
      isLoudSpeech,
      isLaughter,
      laughterConfidence,
      frequencies: this.freqData,
    };
  }
}
