const express = require("express");
const { Client } = require("@line/bot-sdk");
const OpenAI = require("openai");
require("dotenv").config();

// LINE ayarları
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};
const client = new Client(lineConfig);

// OpenAI ayarları (CommonJS uyumlu)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(express.json());

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.sendStatus(200))
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

// Event işleme
async function handleEvent(event) {
  if (event.type === "message" && event.message.type === "text") {
    const userMessage = event.message.text;

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }]
    });

    const replyText = gptResponse.choices[0].message.content;

    return client.replyMessage(event.replyToken, {
      type: "text",
      text: replyText
    });
  }
  return Promise.resolve(null);
}

// Replit otomatik PORT kullan
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GPT LINE Bot ${PORT} portunda çalışıyor 🚀`));


