const TARGET_RATE = 16_000;

function audioContext(): AudioContext {
  const Ctx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) throw new Error("no-audio");
  return new Ctx();
}

function merge(chunks: Float32Array[]) {
  let length = 0;
  for (const chunk of chunks) length += chunk.length;
  const merged = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

function downsample(input: Float32Array, inRate: number, outRate: number) {
  if (outRate >= inRate) return input;
  const ratio = inRate / outRate;
  const length = Math.floor(input.length / ratio);
  const result = new Float32Array(length);
  let offset = 0;
  for (let i = 0; i < length; i += 1) {
    const next = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let j = offset; j < next; j += 1) {
      sum += input[j] ?? 0;
      count += 1;
    }
    result[i] = count ? sum / count : 0;
    offset = next;
  }
  return result;
}

export function encodeWav(samples: Float32Array, sampleRate: number) {
  const pcm = downsample(samples, sampleRate, TARGET_RATE);
  const bytes = new ArrayBuffer(44 + pcm.length * 2);
  const view = new DataView(bytes);
  const write = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + pcm.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, TARGET_RATE, true);
  view.setUint32(28, TARGET_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, pcm.length * 2, true);
  let offset = 44;
  let peak = 0;
  for (let i = 0; i < pcm.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, pcm[i] ?? 0));
    peak = Math.max(peak, Math.abs(sample));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }
  return { blob: new Blob([bytes], { type: "audio/wav" }), peak, seconds: pcm.length / TARGET_RATE };
}

export type IosRecording = {
  opened: Promise<void>;
  finish: () => Promise<{ blob: Blob; peak: number; seconds: number } | null>;
  cancel: () => void;
};

/** Record from the iPhone mic. Call this inside the tap so Safari and Chrome unlock audio. */
export function beginIosRecording(): IosRecording {
  if (!navigator.mediaDevices?.getUserMedia) {
    const missing = Promise.reject(new Error("no-mic"));
    return {
      opened: missing,
      finish: async () => {
        throw new Error("no-mic");
      },
      cancel: () => undefined,
    };
  }
  const context = audioContext();
  void context.resume();
  const chunks: Float32Array[] = [];
  let stream: MediaStream | null = null;
  let processor: ScriptProcessorNode | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let silent: GainNode | null = null;
  let closed = false;

  const ready = navigator.mediaDevices.getUserMedia({ audio: true }).then((next) => {
    stream = next;
    if (closed) return;
    source = context.createMediaStreamSource(next);
    processor = context.createScriptProcessor(4096, 1, 1);
    silent = context.createGain();
    silent.gain.value = 0;
    processor.onaudioprocess = (event) => {
      if (closed) return;
      chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
    };
    source.connect(processor);
    processor.connect(silent);
    silent.connect(context.destination);
  });

  function release() {
    closed = true;
    try {
      processor?.disconnect();
      source?.disconnect();
      silent?.disconnect();
    } catch {
      /* already disconnected */
    }
    stream?.getTracks().forEach((track) => track.stop());
    void context.close();
  }

  return {
    opened: ready.then(() => undefined),
    cancel() {
      void ready.then(release).catch(release);
    },
    async finish() {
      try {
        await ready;
        await context.resume();
        closed = true;
        await new Promise((resolve) => window.setTimeout(resolve, 40));
      } catch (error) {
        release();
        throw error;
      }
      const sampleRate = context.sampleRate || 48_000;
      const samples = merge(chunks);
      release();
      if (samples.length < sampleRate / 4) return null;
      return encodeWav(samples, sampleRate);
    },
  };
}
