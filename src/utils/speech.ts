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
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  static createRecognition(language: 'en-US' | 'bn-IN' | 'en-IN' = 'bn-IN') {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;
    return recognition;
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
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // cancel any active or frozen speech
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {}

    const spokenText = SpeechHelper.convertLatexToSpokenText(text);
    if (!spokenText) return;

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = lang;

    const persona = VOICE_PERSONAS.find((p) => p.id === personaId) || VOICE_PERSONAS[0];
    utterance.pitch = 1.15; // Natural sweet pitch
    utterance.rate = 0.92; // Clear human speaking pace

    const assignVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        let chosenVoice = null;
        
        if (lang === 'bn-IN') {
          // Priority for Bengali or Indian voices
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

      if (onEnd) {
        utterance.onend = () => onEnd();
        utterance.onerror = () => onEnd();
      }

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("Speech synthesis speak error:", err);
        if (onEnd) onEnd();
      }
    };

    // Handle voice loading delays
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        assignVoiceAndSpeak();
        window.speechSynthesis.onvoiceschanged = null;
      };
      // Fallback timeout if voiceschanged doesn't fire
      setTimeout(assignVoiceAndSpeak, 200);
    } else {
      assignVoiceAndSpeak();
    }
  }

  static stopSpeaking() {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }
}

