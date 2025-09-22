// index.js
require('dotenv').config();
const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');


const config = {
channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
channelSecret: process.env.CHANNEL_SECRET,
};


const client = new Client(config);
const app = express();


// Basit cevaplar
const quickReplies = {
'merhaba': 'Merhaba!',
'selam': 'Selam!',
'yardım': 'Komutlar: merhaba, selam, yardım'
};


app.post('/webhook', middleware(config), (req, res) => {
Promise.all(req.body.events.map(handleEvent))
.then(() => res.sendStatus(200))
.catch((err) => {
console.error(err);
res.sendStatus(500);
});
});


async function handleEvent(event) {
if (event.type === 'memberJoined') {
return client.replyMessage(event.replyToken, { type: 'text', text: 'Hoş geldiniz!' });
}


if (event.type === 'memberLeft') {
console.log('Bir üye ayrıldı.');
return Promise.resolve();
}


if (event.type === 'message' && event.message.type === 'text') {
const msg = event.message.text.toLowerCase();
const reply = quickReplies[msg] || 'Bunu anlamadım. "yardım" yazın.';
return client.replyMessage(event.replyToken, { type: 'text', text: reply });
}


return Promise.resolve();
}


app.listen(process.env.PORT || 3000, () => {
console.log('Bot çalışıyor');
});
