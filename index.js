const express = require("express");
const line = require("@line/bot-sdk");

// LINE ayarları (Render Environment Variables üzerinden)
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);
const app = express();

// Webhook endpoint
app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// Event handler (echo)
function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: "text",
    text: `Bana şunu söyledin: ${event.message.text}`,
  });
}

// Sunucu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Echo bot ${PORT} portunda çalışıyor 🚀`);
});
