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
app.use(express.json());


// Basit hazır cevap veritabanı (anahtar: cevap)
const quickReplies = {
'merhaba': 'Merhaba! Nasılsın?',
'selam': 'Selam! Size nasıl yardımcı olabilirim?',
'yardım': 'Yardım için: merhaba, saat, hakkinda',
'hakkinda': 'Bu bir örnek LINE botudur. GitHub: (kendi repo linkinizi ekleyin)'
};


function findReply(text) {
const key = text.trim().toLowerCase();
if (quickReplies[key]) return quickReplies[key];
// kısmi eşleşme (basit)
for (const k of Object.keys(quickReplies)) {
if (key.includes(k)) return quickReplies[k];
}
return null;
}


app.post('/webhook', middleware(config), async (req, res) => {
// LINE'den birden fazla event gelebilir
const events = req.body.events;
if (!events) return res.sendStatus(400);


try {
await Promise.all(events.map(handleEvent));
res.sendStatus(200);
} catch (err) {
console.error(err);
res.sendStatus(500);
}
});


async function handleEvent(event) {
// Event tiplerine göre işlem yap
const type = event.type;


// JOIN: bot sohbet grubuna eklendiğinde gelir
if (type === 'join') {
// replyToken varsa cevap verebiliriz
if (event.replyToken) {
return client.replyMessage(event.replyToken, {
type: 'text',
text: 'Merhaba! Bu gruba katıldım. Üye değişikliklerini izleyeceğim.'
});
}
}


// LEAVE: bot gruptan çıktığında gelir (replyToken yoktur)
if (type === 'leave') {
console.log('Bot gruptan ayrıldı veya kaldırıldı.');
return Promise.resolve(null);
}


// MEMBER JOINED: bir kullanıcı gruba katıldığında gelir
if (type === 'memberJoined' || type === 'memberJoin' || type === 'member_join') {
// event.joined.members array'i içerir (kullanıcı id bilgisi)
const members = (event.joined && event.joined.members) || [];
const names = members.map(m => m.userId ? m.userId : m.replaced ? m.replaced : 'Bilinmeyen').join(', ');
if (event.replyToken) {
return client.replyMessage(event.replyToken, { type: 'text', text: `Yeni üye(ler) katıldı: ${names}` });
}
}


// MEMBER LEFT: kullanıcı gruptan ayrıldığında gelir
if (type === 'memberLeft' || type === 'member_leave' || type === 'memberLeftEvent') {
const members = (event.left && event.left.members) || [];
const names = members.map(m => m.userId ? m.userId : 'Bilinmeyen').join(', ');
// replyToken genellikle yoktur; bu yüzden push veya grupID'ye göre cevap atmak gerekir
// Basitçe loglayalım
app.listen(port, () => console.log(`Bot çalışıyor — port ${port}`));
