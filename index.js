const express = require("express");
const line = require("@line/bot-sdk");

// LINE ayarları
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);
const app = express();
app.use(express.json());

// Sabit cevaplar
const answers = {
  "merhaba": "Merhaba! Nasılsınız?",
  "selam": "Selam! İyi misin?",
  "nasılsın": "Ben bir botum, iyiyim 😊",
  "saat kaç": "Üzgünüm, saati şu an gösteremem.",
  "hava nasıl": "Benim için hep güneşli ☀️",
};

// Webhook endpoint
app.post("/webhook", line.middleware(config), async (req, res) => {
  try {
    if (!req.body || !req.body.events) return res.sendStatus(400);

    for (const event of req.body.events) {
      if (event.type === "message" && event.message.type === "text") {
        const userMessage = event.message.text.toLowerCase();
        let reply = answers[userMessage] || "Üzgünüm, bunu anlayamıyorum 😔";

        await client.replyMessage(event.replyToken, {
          type: "text",
          text: reply,
        });
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sabit cevaplı LINE bot ${PORT} portunda çalışıyor 🚀`);
});
