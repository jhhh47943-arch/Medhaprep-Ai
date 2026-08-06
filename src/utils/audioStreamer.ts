/**
 * Real-Time PCM Audio Stream Player (src/utils/audioStreamer.ts)
 * Decodes 24kHz PCM audio chunks from Gemini Live WebSocket stream and plays them smoothly.
 */

export class AudioStreamer {
  private audioContext: AudioContext | null = null;
  private scheduledTime: number = 0;
  private isPlaying: boolean = false;
  private sampleRate: number = 24000;

  constructor(sampleRate: number = 24000) {
    this.sampleRate = sampleRate;
  }

  private initAudioContext() {
    if (!this.audioContext || this.audioContext.state === "closed") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx({ sampleRate: this.sampleRate });
      this.scheduledTime = this.audioContext.currentTime;
    }
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
  }

  /**
   * Add base64 24kHz raw PCM chunk from Gemini Live to play queue
   */
  public addPCMChunk(base64Pcm: string): void {
    this.initAudioContext();
    if (!this.audioContext) return;

    try {
      const binaryString = atob(base64Pcm);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert Int16 PCM bytes to Float32
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = this.audioContext.createBuffer(
        1,
        float32Array.length,
        this.sampleRate
      );
      audioBuffer.getChannelData(0).set(float32Array);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      const now = this.audioContext.currentTime;
      if (this.scheduledTime < now) {
        this.scheduledTime = now;
      }

      source.start(this.scheduledTime);
      this.scheduledTime += audioBuffer.duration;
      this.isPlaying = true;

      source.onended = () => {
        if (this.audioContext && this.audioContext.currentTime >= this.scheduledTime) {
          this.isPlaying = false;
        }
      };
    } catch (e) {
      console.error("[AudioStreamer Decode Error]:", e);
    }
  }

  public stop(): void {
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.scheduledTime = 0;
    this.isPlaying = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}
