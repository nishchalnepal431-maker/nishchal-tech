import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

app.use(bodyParser.json({ limit: "15mb" }));
app.use(express.static(__dirname));

const AI_INSTRUCTIONS = `
You are Nischal AI, a helpful, intelligent technical AI assistant created by Nischal Nepal.
Speak primarily in clear Nepali. Mix English only when necessary.
Keep answers friendly, engaging, clear, and easy to understand. Use expressive emojis naturally.
`;

function getAIModel() {
    return genAI.getGenerativeModel({
        model: "gemini-pro",
        systemInstruction: AI_INSTRUCTIONS
    });
}

app.post("/api/chat", async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Invalid messages format" });
        }

        const latestMessage = messages[messages.length - 1].content;
        const model = getAIModel();
        const history = messages.slice(0, -1).map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
        }));

        const chatSession = model.startChat({ history });
        const result = await chatSession.sendMessage(latestMessage);
        let answer = result.response.text();

        res.json({ answer });
    } catch (error) {
        console.error("Chat Error:", error.message);
        res.status(500).json({ error: "AI request failed." });
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nischal Tech Server is running on port ${PORT}`);
});
