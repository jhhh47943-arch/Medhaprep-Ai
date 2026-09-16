/**
 * Utility for Web Speech API - Speech Recognition & Speech Synthesis
 */

export type VoicePersonaId = "mahi";

export interface VoicePersona {
  id: VoicePersonaId;
  name: string;
  gender: "Female";
  tagline: string;
  avatar: string;
  pitch: number;
  rate: number;
  description: string;
  imageUrl?: string;
}

export const MAHI_AVATARS: Record<string, { label: string; url: string; emoji: string }> = {
  greeting: { label: "Greeting (স্বাগতম)", url: "https://i.ibb.co/WWHh1m2V/hay.jpg", emoji: "👋" },
  thinking: { label: "Thinking (চিন্তা করা)", url: "https://i.ibb.co/Mx8HBnh3/thinking.jpg", emoji: "🧠" },
  teasing: { label: "Winking (দুষ্টুমি)", url: "https://i.ibb.co/fzg90pKT/wink.jpg", emoji: "😉" },
  blushing: { label: "Blushing (লজ্জা পাওয়া)", url: "https://i.ibb.co/k6zJ0Rby/blush.jpg", emoji: "😳" },
  concerned: { label: "Caring (সহানুভূতি)", url: "https://i.ibb.co/rK9HRgg5/nervous2.jpg", emoji: "🥺" },
  pout: { label: "Cute Pout (অভিমান)", url: "https://i.ibb.co/rBPqMhQ/pout.jpg", emoji: "😚" },
  smirk: { label: "Sassy Smirk (আত্মবিশ্বাস)", url: "https://i.ibb.co/VWnmW51k/smirk.jpg", emoji: "😏" },
  heart_eyes: { label: "Heart Eyes (ভালোবাসা)", url: "https://i.ibb.co/mVMvKSpt/heart-eyes.jpg", emoji: "😍" },
  starry_eyes: { label: "Starry Eyes (আনন্দিত)", url: "https://i.ibb.co/Q7dWVLNg/starry-eyes.jpg", emoji: "🤩" },
  confused: { label: "Confused (কিংকর্তব্যবিমূঢ়)", url: "https://i.ibb.co/LX29jXmW/nervous1.jpg", emoji: "😅" },
  angry: { label: "Angry Pout (রাগ করা)", url: "https://i.ibb.co/23v3Jh0y/angry.jpg", emoji: "😡" },
  relaxed: { label: "Relaxed (হালকা মেজাজ)", url: "https://i.ibb.co/BVSHQHBB/hair-swirl.jpg", emoji: "🌀" },
};

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: "mahi",
    name: "Mahi - মাহি",
    gender: "Female",
    tagline: "Interactive AI Live Avatar Voice Tutor",
    avatar: "👧🏻",
    pitch: 1.25,
    rate: 0.95,
    description: "Interactive female AI voice tutor with 12 live emotion avatar reactions, sweet Bengali/English voice, & step-by-step doubt solving!",
    imageUrl: MAHI_AVATARS.greeting.url,
  },
];

export class SpeechHelper {
  static isSpeechRecognitionSupported(): boolean {
    try {
      return typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    } catch (e) {
      return false;
    }
  }

  static createRecognition(language: 'en-US' | 'bn-IN' | 'en-IN' = 'bn-IN') {
    try {
      if (typeof window === "undefined") return null;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return null;

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;
      return recognition;
    } catch (e) {
      console.warn("SpeechRecognition creation failed on this device:", e);
      return null;
    }
  }

  /**
   * Convert LaTeX formulas & markdown symbols into natural human spoken text
   */
  static convertLatexToSpokenText(text: string): string {
    if (!text) return "";

    let spoken = text;

    // Convert fractions \frac{a}{b} -> a divided by b
    spoken = spoken.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "$1 divided by $2");

    // Convert square roots \sqrt{a} -> square root of a
    spoken = spoken.replace(/\\sqrt\{([^{}]+)\}/g, "square root of $1");

    // Convert powers x^2 -> x squared, x^3 -> x cubed, x^{n} -> x to the power n
    spoken = spoken.replace(/([a-zA-Z0-9]+)\^2\b/g, "$1 squared");
    spoken = spoken.replace(/([a-zA-Z0-9]+)\^3\b/g, "$1 cubed");
    spoken = spoken.replace(/([a-zA-Z0-9]+)\^\{([^{}]+)\}/g, "$1 to the power $2");
    spoken = spoken.replace(/([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)/g, "$1 to the power $2");

    // Convert Greek letters & symbols
    spoken = spoken
      .replace(/\\theta/g, " theta ")
      .replace(/\\pi/g, " pi ")
      .replace(/\\alpha/g, " alpha ")
      .replace(/\\beta/g, " beta ")
      .replace(/\\gamma/g, " gamma ")
      .replace(/\\lambda/g, " lambda ")
      .replace(/\\delta|\\Delta/g, " delta ")
      .replace(/\\infty/g, " infinity ")
      .replace(/\\int/g, " integral ")
      .replace(/\\sum/g, " sum ")
      .replace(/\\pm/g, " plus or minus ")
      .replace(/\\times|\\cdot/g, " times ")
      .replace(/\\div/g, " divided by ")
      .replace(/\\neq/g, " is not equal to ")
      .replace(/\\approx/g, " is approximately ");

    // Clean up conversational interjection brackets like [umm...], [haha!] into natural spoken words
    spoken = spoken.replace(/\[([^\]]+)\]/g, " $1 ");

    // Remove remaining backslashes and LaTeX brackets
    spoken = spoken.replace(/\\([a-zA-Z]+)/g, " $1 ");
    spoken = spoken.replace(/[\{\}\$\\\_]/g, " ");

    // Clean up Markdown formatting symbols
    spoken = spoken
      .replace(/\*{1,3}/g, "")
      .replace(/#{1,6}\s?/g, "")
      .replace(/`{1,3}.*?`{1,3}/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1"); // links

    // Remove excessive whitespace
    return spoken.replace(/\s+/g, " ").trim();
  }

  static speak(
    text: string,
    personaId: VoicePersonaId = "mahi",
    lang: 'en-US' | 'bn-IN' = 'en-US',
    onEnd?: () => void
  ) {
    if (typeof window === "undefined" || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // cancel any active or frozen speech
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {}

    const spokenText = SpeechHelper.convertLatexToSpokenText(text);
    if (!spokenText) {
      if (onEnd) onEnd();
      return;
    }

    let hasRun = false;
    let fallbackTimer: any = null;

    const cleanup = () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (onEnd) {
        onEnd();
      }
    };

    const assignVoiceAndSpeak = () => {
      if (hasRun) return;
      hasRun = true;

      try {
        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.lang = lang;
        utterance.pitch = 1.15;
        utterance.rate = 0.92;

        const voices = window.speechSynthesis.getVoices() || [];
        if (voices.length > 0) {
          let chosenVoice = null;
          
          if (lang === 'bn-IN') {
            chosenVoice = voices.find((v) => v.lang.startsWith("bn") || v.name.toLowerCase().includes("bangla") || v.name.toLowerCase().includes("bengali"));
            if (!chosenVoice) {
              chosenVoice = voices.find((v) => (v.lang.startsWith("hi") || v.lang.startsWith("en-IN")) && (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("google") || v.name.toLowerCase().includes("swara") || v.name.toLowerCase().includes("heera")));
            }
          }

          if (!chosenVoice) {
            chosenVoice = voices.find(
              (v) =>
                (v.name.toLowerCase().includes("female") ||
                  v.name.toLowerCase().includes("zira") ||
                  v.name.toLowerCase().includes("samantha") ||
                  v.name.toLowerCase().includes("victoria") ||
                  v.name.toLowerCase().includes("google") ||
                  v.name.toLowerCase().includes("karen") ||
                  v.name.toLowerCase().includes("natural")) &&
                (v.lang.startsWith("en") || v.lang.startsWith("bn") || v.lang.startsWith("hi"))
            );
          }

          if (!chosenVoice) {
            chosenVoice = voices.find((v) => v.lang.startsWith(lang.split('-')[0]));
          }

          if (chosenVoice) {
            utterance.voice = chosenVoice;
          }
        }

        utterance.onend = () => cleanup();
        utterance.onerror = (e) => {
          console.warn("SpeechSynthesisUtterance error:", e);
          cleanup();
        };

        // Safety timeout in case speech synth hangs on mobile Safari
        const estimatedDurationMs = Math.max(3000, Math.min(25000, (spokenText.length / 10) * 1000));
        fallbackTimer = setTimeout(() => {
          cleanup();
        }, estimatedDurationMs);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("Speech synthesis speak error:", err);
        cleanup();
      }
    };

    try {
      const currentVoices = window.speechSynthesis.getVoices();
      if (!currentVoices || currentVoices.length === 0) {
        let voiceChangedCalled = false;
        window.speechSynthesis.onvoiceschanged = () => {
          if (!voiceChangedCalled) {
            voiceChangedCalled = true;
            window.speechSynthesis.onvoiceschanged = null;
            assignVoiceAndSpeak();
          }
        };
        setTimeout(() => {
          if (!voiceChangedCalled) {
            voiceChangedCalled = true;
            assignVoiceAndSpeak();
          }
        }, 150);
      } else {
        assignVoiceAndSpeak();
      }
    } catch (err) {
      console.error("SpeechSynthesis outer error:", err);
      if (onEnd) onEnd();
    }
  }

  static stopSpeaking() {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }
}

