const express = require("express");
const line = require("@line/bot-sdk");
const OpenAI = require("openai");

// LINE ayarları
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);

// OpenAI ayarları
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(express.json()); // JSON parsing

// Webhook endpoint
app.post("/webhook", line.middleware(config), async (req, res) => {
  try {
    if (!req.body || !req.body.events) {
      console.error("Invalid request body:", req.body);
      return res.sendStatus(400);
    }

    for (const event of req.body.events) {
      await handleEvent(event);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

// Event handler
async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") return;

  try {
    const userMessage = event.message.text;
    console.log("Kullanıcı mesajı:", userMessage);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }],
    });

    const replyText = completion.choices[0].message.content;
    console.log("OpenAI cevabı:", replyText);

    await client.replyMessage(event.replyToken, {
      type: "text",
      text: replyText,
    });
  } catch (error) {
    console.error("OpenAI Hatası:", error);
    try {
      await client.replyMessage(event.replyToken, {
        type: "text",
        text: "Üzgünüm, şu an cevap veremiyorum 😔",
      });
    } catch (err) {
      console.error("LINE reply Hatası:", err);
    }
  }
}

// Port ayarı
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ChatGPT bot ${PORT} portunda çalışıyor 🚀`);
});
