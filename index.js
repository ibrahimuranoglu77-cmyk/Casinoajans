/*
LINE Grup Üye Giriş/Çıkış Botu
- Node.js + Express + @line/bot-sdk
- Çalıştırma: NODE 18+, ortam değişkenleri CHANNEL_ACCESS_TOKEN ve CHANNEL_SECRET ayarlı olmalı
- Webhook URL'niz HTTPS olmalı ve LINE Developers konsolunda set edilmiş olmalı
*/

const line = require('@line/bot-sdk');
const express = require('express');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);
const app = express();

// LINE imza doğrulaması için middleware
app.post('/webhook', line.middleware(config), express.json(), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then(() => res.status(200).end())
    .catch((err) => {
      console.error('handleEvent error', err);
      res.status(500).end();
    });
});

// Helper: userId listesinden isimleri almaya çalış
async function resolveNames(groupId, members) {
  const names = [];
  for (const m of members) {
    try {
      // groupId varsa group profilini, yoksa room profilini dene
      if (groupId) {
        const profile = await client.getGroupMemberProfile(groupId, m.userId);
        names.push(profile.displayName || m.userId);
      } else {
        const profile = await client.getRoomMemberProfile(m.userId);
        names.push(profile.displayName || m.userId);
      }
    } catch (e) {
      // Eğer profil alınamazsa userId koy
      names.push(m.userId);
    }
  }
  return names;
}

async function handleEvent(event) {
  // Sadece memberJoined / memberLeft / join / leave ile ilgileniyoruz
  try {
    if (event.type === 'memberJoined') {
      // event.joined.members: [{userId: '...'}]
      const groupId = event.source.groupId || event.source.roomId || null;
      const memberIds = event.joined && event.joined.members ? event.joined.members : [];
      const names = await resolveNames(groupId, memberIds);
      const text = `Yeni katılan: ${names.join(', ')}`;

      // Eğer replyToken varsa (genelde olabilir) reply, yoksa push
      if (event.replyToken) {
        return client.replyMessage(event.replyToken, { type: 'text', text });
      } else if (groupId) {
        return client.pushMessage(groupId, { type: 'text', text });
      }
      return Promise.resolve(null);
    }

    if (event.type === 'memberLeft') {
      // event.left.members: [{userId: '...'}]
      const groupId = event.source.groupId || event.source.roomId || null;
      const memberIds = event.left && event.left.members ? event.left.members : [];
      // Not: profile bilgisi artık alınamayabilir; bu yüzden userId göstermek gerekebilir
      const names = memberIds.map(m => m.userId);
      const text = `Ayrılan: ${names.join(', ')}`;

      if (groupId) {
        return client.pushMessage(groupId, { type: 'text', text });
      }
      return Promise.resolve(null);
    }

    if (event.type === 'join') {
      // Bot gruba eklendiğinde tetiklenir
      if (event.replyToken) {
        return client.replyMessage(event.replyToken, { type: 'text', text: 'Bot gruba eklendi. Üye giriş/çıkışlarını takip edeceğim.' });
      }
    }

    if (event.type === 'leave') {
      // Bot gruptan çıkarıldı
      console.log('Bot left the group/room', event.source);
      return Promise.resolve(null);
    }

    // Diğer event tipleri için hiçbir şey yapma
    return Promise.resolve(null);
  } catch (err) {
    console.error('Error handling event', err);
    return Promise.resolve(null);
  }
}

// Basit health endpoint
app.get('/', (req, res) => res.send('LINE Grup Bot çalışıyor'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server ${port} portunda çalışıyor`));
