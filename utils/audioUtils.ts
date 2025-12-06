export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export interface AudioController {
  stop: () => void;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  promise: Promise<void>;
}

export function playPcmAudio(
  base64Audio: string, 
  sampleRate: number = 24000
): AudioController {
  let audioContext: AudioContext | null = null;
  let source: AudioBufferSourceNode | null = null;
  let isStopped = false;

  const promise = new Promise<void>(async (resolve, reject) => {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate,
      });
      
      const pcmData = decodeBase64(base64Audio);
      
      // Convert 16-bit PCM to Float32
      const int16Data = new Int16Array(pcmData.buffer);
      const float32Data = new Float32Array(int16Data.length);
      for (let i = 0; i < int16Data.length; i++) {
          float32Data[i] = int16Data[i] / 32768.0;
      }

      const buffer = audioContext.createBuffer(1, float32Data.length, sampleRate);
      buffer.getChannelData(0).set(float32Data);

      source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        if (!isStopped && audioContext?.state === 'running') {
            audioContext.close();
            resolve();
        }
      };
      
      source.start(0);

    } catch (e) {
      console.error("Error playing audio", e);
      reject(e);
    }
  });

  return {
    promise,
    stop: () => {
      isStopped = true;
      try {
        source?.stop();
        audioContext?.close();
      } catch (e) {}
    },
    pause: async () => {
      if (audioContext?.state === 'running') {
        await audioContext.suspend();
      }
    },
    resume: async () => {
      if (audioContext?.state === 'suspended') {
        await audioContext.resume();
      }
    }
  };
}