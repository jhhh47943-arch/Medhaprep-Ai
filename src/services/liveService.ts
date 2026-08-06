/**
 * Gemini Multimodal Live Service (src/services/liveService.ts)
 * 
 * Provides real-time zero-latency bidirectional voice and multimodal interaction
 * via WebSockets connection to the Gemini Live Model (gemini-3.1-flash-live-preview).
 */

export interface LiveServiceOptions {
  apiKey?: string;
  voiceName?: "Kore" | "Zephyr" | "Fenrir" | "Aoede";
  systemInstruction?: string;
  onAudioChunk?: (base64Audio: string) => void;
  onTextChunk?: (text: string) => void;
  onAnimationMetadata?: (emotion: string) => void;
  onLiveBoardUpdate?: (data: { topic: string; content: string; type?: string }) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error | Event) => void;
}

export class GeminiLiveService {
  private ws: WebSocket | null = null;
  private options: LiveServiceOptions = {};
  private isConnected: boolean = false;

  constructor(options: LiveServiceOptions = {}) {
    this.options = options;
  }

  public setOptions(options: Partial<LiveServiceOptions>) {
    this.options = { ...this.options, ...options };
  }

  /**
   * Connect to the Gemini Multimodal Live API WebSocket stream
   */
  public async connect(apiKey?: string): Promise<void> {
    const key = apiKey || this.options.apiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
    if (!key) {
      throw new Error("Gemini API key is required to establish WebSocket live session.");
    }

    if (this.ws && this.isConnected) {
      this.disconnect();
    }

    const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${key}`;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.sendInitialSetup();
          if (this.options.onConnect) this.options.onConnect();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleServerMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error("[Gemini Live WebSocket Error]:", error);
          if (this.options.onError) this.options.onError(error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          if (this.options.onDisconnect) this.options.onDisconnect();
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Send setup configuration packet upon WebSocket connection
   */
  private sendInitialSetup(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const voice = this.options.voiceName || "Kore";
    const systemPrompt = this.options.systemInstruction || 
      "You are Mahi, a friendly and intelligent AI study companion. Speak warmly in Bengali and English (Banglish) to help students learn smoothly.";

    const setupMessage = {
      setup: {
        model: "models/gemini-3.1-flash-live-preview",
        generationConfig: {
          responseModalities: ["AUDIO", "TEXT"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice
              }
            }
          }
        },
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        tools: [
          {
            functionDeclarations: [
              {
                name: "updateAnimationMetadata",
                description: "Updates Mahi's live avatar reaction image and facial expression based on speech emotion.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    emotion: {
                      type: "STRING",
                      description: "One of Mahi's emotion keys: greeting, thinking, teasing, blushing, concerned, pout, smirk, heart_eyes, starry_eyes, confused, angry, relaxed"
                    }
                  },
                  required: ["emotion"]
                }
              },
              {
                name: "updateLiveBoard",
                description: "Sends interactive notes, formulas, or diagrams to the live study board during tutor explanations.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    topic: {
                      type: "STRING",
                      description: "Topic title for the live board item"
                    },
                    content: {
                      type: "STRING",
                      description: "Detailed markdown content, equation, or notes"
                    },
                    type: {
                      type: "STRING",
                      description: "Type of content: note, formula, diagram"
                    }
                  },
                  required: ["topic", "content"]
                }
              }
            ]
          }
        ]
      }
    };

    this.ws.send(JSON.stringify(setupMessage));
  }

  /**
   * Handle incoming WebSocket messages from Gemini Live Server
   */
  private handleServerMessage(data: any): void {
    try {
      let messageStr = data;
      if (data instanceof Blob) {
        // Handle Blob if necessary
        const reader = new FileReader();
        reader.onload = () => this.parseJsonMessage(reader.result as string);
        reader.readAsText(data);
        return;
      }
      this.parseJsonMessage(messageStr);
    } catch (e) {
      console.error("[LiveService Message Handling Error]:", e);
    }
  }

  private parseJsonMessage(jsonString: string): void {
    try {
      const msg = JSON.parse(jsonString);

      if (!msg.serverContent) {
        if (msg.toolCall) {
          this.handleToolCalls(msg.toolCall);
        }
        return;
      }

      const modelTurn = msg.serverContent.modelTurn;
      if (modelTurn && modelTurn.parts) {
        for (const part of modelTurn.parts) {
          // Audio Chunk
          if (part.inlineData && part.inlineData.mimeType?.startsWith("audio/")) {
            if (this.options.onAudioChunk) {
              this.options.onAudioChunk(part.inlineData.data);
            }
          }
          // Text Transcript
          if (part.text) {
            if (this.options.onTextChunk) {
              this.options.onTextChunk(part.text);
            }
          }
        }
      }

      // Check tool calls inside serverContent
      if (msg.serverContent.toolCall) {
        this.handleToolCalls(msg.serverContent.toolCall);
      }
    } catch (err) {
      console.error("Error parsing Gemini live message:", err);
    }
  }

  /**
   * Execute function calls requested by Gemini AI
   */
  private handleToolCalls(toolCallData: any): void {
    const calls = toolCallData.functionCalls || [];
    const responses = [];

    for (const call of calls) {
      const { name, args, id } = call;

      if (name === "updateAnimationMetadata") {
        const emotion = args?.emotion || "greeting";
        if (this.options.onAnimationMetadata) {
          this.options.onAnimationMetadata(emotion);
        }
        responses.push({
          id,
          name,
          response: { output: { success: true, emotion } }
        });
      } else if (name === "updateLiveBoard") {
        if (this.options.onLiveBoardUpdate) {
          this.options.onLiveBoardUpdate({
            topic: args?.topic || "Study Note",
            content: args?.content || "",
            type: args?.type || "note"
          });
        }
        responses.push({
          id,
          name,
          response: { output: { success: true, updated: true } }
        });
      }
    }

    if (responses.length > 0) {
      this.sendToolResponse(responses);
    }
  }

  /**
   * Send response back to model after executing client-side tool function
   */
  public sendToolResponse(functionResponses: any[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message = {
      toolResponse: {
        functionResponses
      }
    };
    this.ws.send(JSON.stringify(message));
  }

  /**
   * Stream continuous PCM Microphone audio chunk (base64 16kHz PCM Int16)
   */
  public sendAudioChunk(base64Pcm: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const realtimeInput = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: "audio/pcm;rate=16000",
            data: base64Pcm
          }
        ]
      }
    };

    this.ws.send(JSON.stringify(realtimeInput));
  }

  /**
   * Send a text message turn to Gemini Live
   */
  public sendTextMessage(text: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const clientContent = {
      clientContent: {
        turns: [
          {
            role: "user",
            parts: [{ text }]
          }
        ],
        turnComplete: true
      }
    };

    this.ws.send(JSON.stringify(clientContent));
  }

  /**
   * Close the WebSocket connection
   */
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }
}

// Singleton helper instance
export const liveService = new GeminiLiveService();
