import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // ensure node-fetch v3+

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/ask", async (req, res) => {
  const { question } = req.body;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: `You are a concise and friendly AI interview assistant.
- Always answer clearly and simply.
- Use short sentences and avoid technical jargon.
- Limit your answer to 2-4 lines maximum.
- If needed, use bullet points for clarity.
- Do not over-explain.`,
            },
            { role: "user", content: question },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", errText);
      return res.status(500).json({ error: "Groq API failed." });
    }

    const data = await response.json();
    const answer =
      data.choices?.[0]?.message?.content || "No answer from Groq.";
    return res.json({ answer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Groq API error." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
