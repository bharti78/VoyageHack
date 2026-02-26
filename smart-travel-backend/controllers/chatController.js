const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function normalizeReplyText(result) {
  const direct = result?.response?.text?.();
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const parts = result?.response?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const joined = parts
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .filter(Boolean)
      .join("\n")
      .trim();
    if (joined) return joined;
  }

  return "";
}

exports.chat = async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(message);
    console.log("Gemini raw response object:", result);
    const reply = normalizeReplyText(result) || "I couldn't generate a response right now.";

    return res.json({ reply });
  } catch (error) {
    const status = Number(error?.status || error?.statusCode || 500);
    console.error("Gemini chat error:", error?.message || error);

    if (status === 429) {
      return res.status(429).json({ error: "Gemini rate limit reached. Please try again shortly." });
    }
    if (status === 401 || status === 403) {
      return res.status(401).json({ error: "Invalid Gemini API key." });
    }
    if (status >= 500) {
      return res.status(502).json({ error: "Gemini service is temporarily unavailable." });
    }
    return res.status(500).json({ error: "Failed to generate AI response." });
  }
};
