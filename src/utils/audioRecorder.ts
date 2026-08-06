/**
 * Low-Latency Microphone PCM Audio Processor (src/utils/audioRecorder.ts)
 * Captures 16kHz Mono Int16 PCM Audio from microphone with echo cancellation and noise suppression
 * and converts it to Base64 PCM for real-time Gemini Live WebSocket streaming.
 */

export class AudioRecorder {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private onAudioChunkCallback: ((base64Pcm: string) => void) | null = null;
  private isRecording: boolean = false;

  constructor(onAudioChunk?: (base64Pcm: string) => void) {
    if (onAudioChunk) {
      this.onAudioChunkCallback = onAudioChunk;
    }
  }

  public setCallback(callback: (base64Pcm: string) => void) {
    this.onAudioChunkCallback = callback;
  }

  public async start(): Promise<void> {
    if (this.isRecording) return;

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioCtx({ sampleRate: 16000 });

    this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
    // 2048 buffer size gives ~128ms chunks at 16kHz
    this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.isRecording) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const pcmInt16 = this.float32ToInt16(inputData);
      const base64 = this.arrayBufferToBase64(pcmInt16.buffer);

      if (this.onAudioChunkCallback) {
        this.onAudioChunkCallback(base64);
      }
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
    this.isRecording = true;
  }

  public stop(): void {
    this.isRecording = false;

    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  private float32ToInt16(buffer: Float32Array): Int16Array {
    let l = buffer.length;
    const buf = new Int16Array(l);
    while (l--) {
      const s = Math.max(-1, Math.min(1, buffer[l]));
      buf[l] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return buf;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }
}
