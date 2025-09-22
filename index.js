const express = require("express");
const line = require("@line/bot-sdk");

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);
const app = express();

app.post("/webhook", line.middleware(config), (req, res) => {
  res.sendStatus(200);
  req.body.events.map(async (event) => {
    if (event.type === "message" && event.message.type === "text") {
      await client.replyMessage(event.replyToken, {
        type: "text",
        text: "Merhaba, bot çalışıyor ✅",
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot ${PORT} portunda çalışıyor 🚀`);
});
