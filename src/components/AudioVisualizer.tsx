import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  frequencies: Uint8Array;
  decibels: number;
  thresholdDb: number;
  isActive: boolean;
  isLoud: boolean;
}

export function AudioVisualizer({
  frequencies,
  decibels,
  thresholdDb,
  isActive,
  isLoud,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // If inactive, draw subtle flat baseline
    if (!isActive || frequencies.length === 0) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.fillRect(0, height / 2 - 1, width, 2);
      return;
    }

    // Draw Frequency Bars
    const barCount = 48;
    const barWidth = (width / barCount) - 2;
    const step = Math.floor(frequencies.length / barCount);

    for (let i = 0; i < barCount; i++) {
      const freqIndex = i * step;
      const rawVal = frequencies[freqIndex] || 0;
      const barHeight = Math.max(3, (rawVal / 255) * (height - 14));
      const x = i * (barWidth + 2);
      const y = height - barHeight;

      // Color gradation
      if (isLoud) {
        ctx.fillStyle = '#f43f5e'; // Rose-500
      } else if (decibels > thresholdDb - 8) {
        ctx.fillStyle = '#f59e0b'; // Amber-500
      } else {
        ctx.fillStyle = '#6366f1'; // Indigo-500
      }

      // Rounded top bar
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
      ctx.fill();
    }

    // Draw Threshold Guide Line
    // Map thresholdDb (20 - 105 dB) to vertical canvas coordinate
    const normThreshold = Math.max(0, Math.min(1, (thresholdDb - 20) / 85));
    const thresholdY = height - (normThreshold * (height - 14));

    ctx.strokeStyle = isLoud ? 'rgba(244, 63, 94, 0.8)' : 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, thresholdY);
    ctx.lineTo(width, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [frequencies, decibels, thresholdDb, isActive, isLoud]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-slate-900 dark:bg-black/40 p-3 border border-slate-800">
      <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
        <span className="font-medium">Live Acoustic Spectrum</span>
        <div className="flex items-center gap-3 font-mono tabular-nums">
          <span className="text-slate-400">
            Threshold: <strong className="text-amber-400 font-semibold">{thresholdDb} dB</strong>
          </span>
          <span className="text-slate-300">·</span>
          <span>
            Current: <strong className={isLoud ? 'text-rose-400 font-bold' : 'text-indigo-400 font-semibold'}>{isActive ? decibels : '--'} dB</strong>
          </span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={480}
        height={90}
        className="w-full h-24 rounded-lg block"
      />

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>80 Hz (Vocal Base)</span>
        <span>1.5 kHz (Speech Formants)</span>
        <span>3.5 kHz (Laughter Spikes)</span>
      </div>
    </div>
  );
}
