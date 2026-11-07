export type OrderAlarm = {
  unlock(): Promise<boolean>;
  play(): boolean;
  stop(): void;
  dispose(): void;
  /** Whether the browser currently allows audio playback. */
  isRunning(): boolean;
};

/** Create lazily: importing this module and rendering the admin on the server is safe. */
export function createOrderAlarm(): OrderAlarm {
  let context: AudioContext | null = null;
  let active: { oscillator: OscillatorNode; gain: GainNode } | null = null;
  let disposed = false;

  function stop() {
    const sound = active;
    active = null;
    if (!sound) return;
    sound.oscillator.onended = null;
    try { sound.oscillator.stop(); } catch { /* Already stopped by the browser. */ }
    try { sound.oscillator.disconnect(); } catch { /* Already disconnected. */ }
    try { sound.gain.disconnect(); } catch { /* Already disconnected. */ }
  }

  const isRunning = () => !disposed && context?.state === "running";

  return {
    async unlock() {
      if (disposed || typeof window === "undefined") return false;
      try {
        if (!context || context.state === "closed") {
          const Constructor = window.AudioContext ??
            (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (!Constructor) return false;
          // This executes before the first await, while the click's user activation is live.
          context = new Constructor();
        }
        const current = context;
        if (current.state === "running") return true;
        let timeout: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.race([
            current.resume(),
            new Promise<void>(resolve => { timeout = setTimeout(resolve, 1500); }),
          ]);
          return context === current && isRunning();
        } finally {
          if (timeout) clearTimeout(timeout);
        }
      } catch {
        return false;
      }
    },
    play() {
      if (!isRunning() || !context) return false;
      if (active) return true;
      let oscillator: OscillatorNode | undefined;
      let gain: GainNode | undefined;
      try {
        oscillator = context.createOscillator();
        gain = context.createGain();
        const sound = { oscillator, gain };
        active = sound;
        oscillator.type = "square";
        oscillator.connect(gain);
        gain.connect(context.destination);
        const start = context.currentTime + 0.01;
        gain.gain.setValueAtTime(0, context.currentTime);
        // Eight sharp, alternating pulses. Short ramps avoid clicks at their edges.
        for (let pulse = 0; pulse < 8; pulse++) {
          const at = start + pulse * 0.26;
          oscillator.frequency.setValueAtTime(pulse % 2 ? 1395 : 930, at);
          gain.gain.setValueAtTime(0, at);
          gain.gain.linearRampToValueAtTime(0.25, at + 0.008);
          gain.gain.setValueAtTime(0.25, at + 0.18);
          gain.gain.linearRampToValueAtTime(0, at + 0.20);
        }
        oscillator.onended = () => {
          if (active === sound) active = null;
          sound.oscillator.disconnect();
          sound.gain.disconnect();
        };
        oscillator.start(start);
        oscillator.stop(start + 2.08);
        return true;
      } catch {
        stop();
        // A constructor failure can happen before both nodes are assigned to active.
        try { oscillator?.disconnect(); } catch { /* Browser resource already released. */ }
        try { gain?.disconnect(); } catch { /* Browser resource already released. */ }
        return false;
      }
    },
    stop,
    dispose() {
      disposed = true;
      stop();
      const current = context;
      context = null;
      if (current && current.state !== "closed") void current.close().catch(() => {});
    },
    isRunning,
  };
}
