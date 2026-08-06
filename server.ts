import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: "25mb" }));

  // Helper to get requested model or fallback (with mapping for deprecated/legacy model strings)
  const getModelName = (req: express.Request, fallback = "gemini-3.6-flash") => {
    let rawModel = (req.headers["x-gemini-model"] as string | undefined)?.trim();
    if (!rawModel && req.body && typeof req.body.preferredModel === "string") {
      rawModel = req.body.preferredModel.trim();
    }
    
    if (!rawModel) return fallback;

    // Map deprecated or custom invalid model names to official current Gemini models
    const legacyMap: Record<string, string> = {
      "gemini-3.5-flash": "gemini-3.6-flash",
      "gemini-2.5-flash": "gemini-3.6-flash",
      "gemini-2.0-flash": "gemini-3.6-flash",
      "gemini-1.5-flash": "gemini-3.6-flash",
      "gemini-2.5-pro": "gemini-3.1-pro-preview",
      "gemini-1.5-pro": "gemini-3.1-pro-preview",
      "gemini-pro": "gemini-3.1-pro-preview",
    };

    return legacyMap[rawModel] || rawModel;
  };

  // Helper to initialize GenAI with fallback or custom user provided key
  const getGenAI = (req: express.Request) => {
    const customKey = (req.headers["x-custom-gemini-key"] as string | undefined) || (req.headers["x-gemini-api-key"] as string | undefined);
    const apiKey = (customKey && customKey.trim().length > 5) 
      ? customKey.trim() 
      : process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY in environment or provide a key in Settings.");
    }

    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Route: Health Check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", appName: "MedhaPrep AI" });
  });

  // API Route 1: Generate AI Mock Test
  app.post("/api/generate-test", async (req, res) => {
    try {
      const {
        board, // e.g. "WBCHSE", "WBBSE", "JEE Mains", "NEET", "WBJEE"
        targetClass, // e.g. "Class 10", "Class 12", "Repeater"
        subject, // e.g. "Physics", "Chemistry", "Mathematics", "Life Science", "Physical Science", "English"
        topic, // Chapter / Topic name
        difficulty, // "Easy", "Medium", "Hard"
        numQuestions = 10,
        questionTypes = ["MCQ"],
        includePYQ = true,
        language = "English & Bengali", // "English", "Bengali", "English & Bengali"
      } = req.body;

      const ai = getGenAI(req);

      const systemInstruction = `You are a master exam creator for Indian education boards, specifically West Bengal State Board (WBBSE/WBCHSE), JEE Mains, NEET, and WBJEE.
Generate high quality, accurate exam questions based on official board syllabi and past exam patterns.
CRITICAL FOR SOLUTIONS: Always provide rich, comprehensive, step-by-step solutions in BOTH Bengali (বাংলা ব্যাখ্যা) and English.
Each solution MUST include:
1. **Core Concept / Basic Formula (মূল সূত্র)**
2. **Step-by-Step Derivation / Step 1, Step 2 Calculation (ধাপ ১, ধাপ ২ গাণিতিক সমাধান)** formatted with KaTeX LaTeX math $...$
3. **Key Reason / Conclusion (সঠিক উত্তরের বাংলা মূল কারণ)**
4. **Exam Shortcut Trick / Quick Tip (পরীক্ষার শর্টকাট ট্রিক)**
Format all mathematical equations, scientific variables, and formulas strictly using LaTeX KaTeX format:
Use $...$ for inline equations (e.g. $E=mc^2$, $\\theta$, $\\int f(x) dx$, $\\frac{a}{b}$, $\\sqrt{x}$) and $$...$$ for centered block equations.
Respond ONLY in valid JSON strictly matching the provided schema.`;

      const prompt = `Create a test set with ${numQuestions} questions for:
- Board / Exam Target: ${board}
- Target Class/Level: ${targetClass || "Standard"}
- Subject: ${subject}
- Chapter/Topic: ${topic}
- Difficulty Level: ${difficulty}
- Included Question Types: ${questionTypes.join(", ")}
- Include Board Past Year Questions (PYQs) style: ${includePYQ ? "Yes (Include authentic PYQ reference notes where applicable)" : "No"}
- Output Language: ${language} (Provide bilingual or clear translated text if requested)

Ensure every question includes:
1. Question ID (unique string)
2. Question Text (clear, precise, in ${language}, with KaTeX $...$ for all math)
3. Question Type (e.g. "MCQ", "Short Answer", "True/False", "Numerical", "Assertion-Reason")
4. Difficulty Level
5. Options array (4 choices for MCQs, with KaTeX math formatting)
6. Correct Answer (0-indexed number string e.g. "0" for 1st choice for MCQ, or exact answer for numerical)
7. Detailed Step-by-Step Solution / Explanation (explaining why it's correct with LaTeX formulas and shortcut tips)
8. PYQ Tag/Note if applicable (e.g. "WBCHSE 2022", "JEE Mains 2023 Shift 1" or null)`;

      const targetModel = getModelName(req, "gemini-3.1-pro-preview");
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              board: { type: Type.STRING },
              subject: { type: Type.STRING },
              topic: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    question: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correctAnswer: { type: Type.STRING, description: "Index string e.g. '0','1' for MCQ or answer string" },
                    solution: { type: Type.STRING },
                    pyqTag: { type: Type.STRING },
                  },
                  required: ["id", "type", "question", "options", "correctAnswer", "solution"],
                },
              },
            },
            required: ["title", "board", "subject", "topic", "questions"],
          },
        },
      });

      const jsonText = response.text || "{}";
      const parsedData = JSON.parse(jsonText);
      res.json({ success: true, test: parsedData });
    } catch (err: any) {
      console.error("Error generating test:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to generate AI Mock Test" });
    }
  });

  // API Route 2: Generate YouTube & File Study Notes
  app.post("/api/generate-notes", async (req, res) => {
    try {
      const {
        inputType, // "youtube", "text", "pdf"
        sourceContent, // URL or pasted text or document text
        noteStyle, // "detailed", "short_notes", "formulae_defs", "flashcards"
        targetLanguage = "Bengali", // "Bengali", "English", "Bilingual"
        subject,
      } = req.body;

      const ai = getGenAI(req);

      const systemInstruction = `You are an expert AI Study Notes & Revision Generator for competitive and board students in West Bengal (WBBSE/WBCHSE, JEE, NEET, WBJEE).
You excel at taking YouTube video content summaries, raw text, or textbook documents and converting them into deeply detailed, comprehensive revision notes.
ALWAYS format all mathematical formulas, chemical equations, and physics laws using LaTeX KaTeX format: $...$ for inline math and $$...$$ for block formulas.
ALWAYS include a dedicated section for "Exam Short Tricks, Mnemonics & Fast Problem Solving Tricks" (শর্ট ট্রিক ও সহজ সমাধান কৌশল).
Support dual language outputs: Bengali (বাংলা), English, or Bilingual (English with Bengali translations).`;

      const prompt = `Generate comprehensive, highly detailed study notes based on:
- Input Source Type: ${inputType}
- Source Content/Link: ${sourceContent}
- Subject Context: ${subject || "General Study"}
- Note Style requested: ${noteStyle}
- Target Output Language: ${targetLanguage}

Provide complete thorough coverage of the entire video/document topic. Do not skip details.
Return structured JSON containing:
1. Title
2. Overview Summary (Comprehensive overview of total concept)
3. Main Topic Sections with Deep Explanations, Step-by-Step Derivations, and Key Takeaways (All math equations in KaTeX $...$)
4. Key Formulae & Definitions (with unit conversions and LaTeX notation)
5. Exam Short Tricks & Mnemonics (Explicit shortcut techniques, quick elimination rules, memory hacks for speed solving)
6. Short Revision Points (Bullet recap)
7. Flashcards
8. Practice Questions with Solutions`;

      const targetModel = getModelName(req, "gemini-3.6-flash");
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subject: { type: Type.STRING },
              language: { type: Type.STRING },
              overview: { type: Type.STRING },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    heading: { type: Type.STRING },
                    content: { type: Type.STRING },
                    keyTakeaways: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["heading", "content"],
                },
              },
              keyFormulaeAndDefs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    termOrFormula: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ["termOrFormula", "explanation"],
                },
              },
              shortTricks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    trickTitle: { type: Type.STRING },
                    conceptOrFormula: { type: Type.STRING },
                    shortcutMethod: { type: Type.STRING },
                  },
                  required: ["trickTitle", "shortcutMethod"],
                },
              },
              shortRevisionPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING },
                    back: { type: Type.STRING },
                  },
                  required: ["front", "back"],
                },
              },
              practiceQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                  },
                  required: ["question", "answer"],
                },
              },
            },
            required: ["title", "overview", "sections"],
          },
        },
      });

      const jsonText = response.text || "{}";
      const parsedData = JSON.parse(jsonText);
      res.json({ success: true, notes: parsedData });
    } catch (err: any) {
      console.error("Error generating notes:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to generate AI Study Notes" });
    }
  });

  // API Route 3: Generate Oral Viva Question
  app.post("/api/generate-viva-question", async (req, res) => {
    try {
      const { subject, topic, board, difficulty = "Medium" } = req.body;

      const ai = getGenAI(req);

      const prompt = `Generate 1 clear oral viva / verbal reasoning practice question for:
- Board/Exam: ${board || "WBCHSE/JEE"}
- Subject: ${subject || "Physics/Chemistry/Biology/Math"}
- Chapter/Topic: ${topic || "General Concepts"}
- Difficulty: ${difficulty}

Format all mathematical notation using LaTeX $...$.
Format: JSON with:
- vivaQuestion: String (The spoken question to display/read)
- vivaQuestionBengali: String (Bengali translation of the question)
- keyPointsExpected: Array of strings (Key concepts the student should mention)
- hint: String`;

      const targetModel = getModelName(req, "gemini-3.6-flash");
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              vivaQuestion: { type: Type.STRING },
              vivaQuestionBengali: { type: Type.STRING },
              keyPointsExpected: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              hint: { type: Type.STRING },
            },
            required: ["vivaQuestion", "keyPointsExpected"],
          },
        },
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json({ success: true, questionData: parsedData });
    } catch (err: any) {
      console.error("Error generating viva question:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to generate Viva Question" });
    }
  });

  // API Route 4: Evaluate Voice / Verbal Answer
  app.post("/api/evaluate-voice-viva", async (req, res) => {
    try {
      const {
        question,
        userSpokenAnswer,
        expectedKeyPoints = [],
        language = "Bilingual",
      } = req.body;

      const ai = getGenAI(req);

      const prompt = `Evaluate the following verbal answer given by a student for a viva / oral reasoning exam:
Viva Question: "${question}"
Student's Verbal Response: "${userSpokenAnswer}"
Expected Concepts: ${expectedKeyPoints.join(", ")}
Language Context: ${language}

Analyze the response thoroughly and return JSON with:
1. scoreOutOf100: Number (0-100)
2. conceptualAccuracyRating: String ("Excellent", "Good", "Needs Improvement", "Poor")
3. clarityAndFluencyScore: Number (0-100)
4. detailedFeedback: String (Constructive feedback in Bengali and English)
5. missingConcepts: Array of strings (Key points missed by student)
6. suggestedModelAnswerEnglish: String (Ideal model response in English)
7. suggestedModelAnswerBengali: String (Ideal model response in Bengali - বাংলা model উত্তর)`;

      const targetModel = getModelName(req, "gemini-3.6-flash");
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scoreOutOf100: { type: Type.NUMBER },
              conceptualAccuracyRating: { type: Type.STRING },
              clarityAndFluencyScore: { type: Type.NUMBER },
              detailedFeedback: { type: Type.STRING },
              missingConcepts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              suggestedModelAnswerEnglish: { type: Type.STRING },
              suggestedModelAnswerBengali: { type: Type.STRING },
            },
            required: ["scoreOutOf100", "conceptualAccuracyRating", "detailedFeedback", "suggestedModelAnswerEnglish"],
          },
        },
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json({ success: true, evaluation: parsedData });
    } catch (err: any) {
      console.error("Error evaluating voice viva:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to evaluate verbal response" });
    }
  });

  // API Route 5: Live AI Voice Doubt Solver & Voice Companion Chat
  app.post("/api/voice-doubt-solver", async (req, res) => {
    try {
      const {
        questionContext = "",
        userVoiceQuery = "",
        personaId = "mahi",
        language = "Bilingual",
      } = req.body;

      const ai = getGenAI(req);

      const systemInstruction = `You are an ultra-realistic, warm, friendly AI voice tutor for students studying for WBBSE, WBCHSE, JEE Mains, NEET, and WBJEE exams in West Bengal.
Persona requested: ${personaId} (Active persona: ${personaId === "mahi" ? "Mahi - Flagship Interactive AI Avatar Tutor (Sweet, playful & sharp)" : personaId === "ananya" ? "Ananya - Warm Sister Tutor" : personaId === "priya" ? "Priya - Energetic Buddy" : personaId === "rahul" ? "Rahul - Smart Mentor" : "Arjun - Confident Coach"}).

CRITICAL INSTRUCTIONS FOR NATURAL EXPRESSIVE SPEECH & AVATAR REACTION:
1. Act like a real human tutor talking directly to the student! Include natural conversational interjections and emotional sound reactions like [umm...], [haha!], [Aha!], [Arey shabbas!], [hmm...], [bujhle?], [oh I see!].
2. Keep the spoken text (aiSpeechText) conversational, engaging, empathetic, and clear so it sounds amazing when spoken aloud via Text-to-Speech!
3. In aiDisplayMarkdown, render deep step-by-step explanations with LaTeX KaTeX math ($...$), formulas, and exam short tricks.
4. Select the most fitting avatarEmotion string from one of: ["greeting", "thinking", "teasing", "blushing", "concerned", "pout", "smirk", "heart_eyes", "starry_eyes", "confused", "angry", "relaxed"].
5. Language context: ${language}. Use natural Bengali (বাংলা) and English words seamlessly.`;

      const prompt = `Student asked a doubt via Live Voice:
Question / Exam Context: "${questionContext}"
Student's Spoken Query: "${userVoiceQuery}"

Generate JSON response containing:
1. aiSpeechText: String (Expressive, friendly spoken response incorporating human reactions like [umm...], [haha!], [Aha!], [Arey shabbas!], [bujhle?])
2. aiDisplayMarkdown: String (Full step-by-step solution formatted with KaTeX math $...$ and key short trick)
3. keyTakeaway: String (Short 1-line recap)
4. reactionUsed: String (e.g. "Encouraging laugh", "Thoughtful umm", "Praise shabbas")
5. avatarEmotion: String (One of "greeting", "thinking", "teasing", "blushing", "concerned", "pout", "smirk", "heart_eyes", "starry_eyes", "confused", "angry", "relaxed")`;

      const targetModel = getModelName(req, "gemini-3.6-flash");
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiSpeechText: { type: Type.STRING },
              aiDisplayMarkdown: { type: Type.STRING },
              keyTakeaway: { type: Type.STRING },
              reactionUsed: { type: Type.STRING },
              avatarEmotion: { type: Type.STRING },
            },
            required: ["aiSpeechText", "aiDisplayMarkdown"],
          },
        },
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json({ success: true, result: parsedData });
    } catch (err: any) {
      console.error("Error in voice doubt solver:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to process voice doubt" });
    }
  });

  // Setup Vite middleware in Dev Mode or Static serve in Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MedhaPrep AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
