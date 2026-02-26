const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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
    const reply = result?.response?.text?.() || "";

    return res.json({ reply });
  } catch (error) {
    console.error("Gemini chat error:", error?.message || error);
    return res.status(500).json({ error: "Failed to generate AI response." });
  }
};
