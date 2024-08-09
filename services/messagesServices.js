"use strict";

// Model ve fonksiyonları içe aktar
const Message_List = require("../models/messages");
const User = require("../models/users");
//const oneSignal = require("../functions/onesignal");

// Mesajları veritabanına eklemek için ana fonksiyon
async function addToDatabase(messages, from, to) {
  try {
    // Şu anki tarih ve saat bilgilerini al
    const currentDate = new Date();
    const dateTime = currentDate.getTime();

    // Mesajların benzersiz ID'lerini oluştur
    const messagesId = `${from}_${to}`;
    const messagesIdReverse = `${to}_${from}`;

    // Kullanıcı bilgilerini al
    const firstUser = await getUserInfo(from);
    const secondUser = await getUserInfo(to);

    // Mesaj türüne göre işlemi gerçekleştir
    if (messages.type === "text") {
      await handleTextMessage(messages, from, to, firstUser, secondUser, messagesId, messagesIdReverse, dateTime);
    } else {
      return false; // Diğer mesaj türleri desteklenmiyor
    }
  } catch (error) {
    console.error("Mesaj veritabanına eklenirken bir hata oluştu:", error);
    return false;
  }
}


// Metin mesajlarını işlemek için fonksiyon
async function handleTextMessage(messages, from, to, firstUser, secondUser, messagesId, messagesIdReverse, dateTime) {
  // Mesaj ID'sinin zaten mevcut olup olmadığını kontrol et
  const updatePromise = firstUser.messages.includes(messagesId) || firstUser.messages.includes(messagesIdReverse)
    ? updateMessageList(messages, from, messagesId, messagesIdReverse, dateTime) // Güncelle
    : createNewMessageList(messages, from, to, messagesId, dateTime); // Yeni liste oluştur

  // Güncelleme başarılıysa kullanıcıyı bilgilendir
  if (updatePromise) {
    console.log('bildirim')
    // await notifyUser(messages.text, secondUser.oneSignalId, firstUser, secondUser);
    return true;
  }
  return false;
}

// Var olan mesaj listesini güncelle
async function updateMessageList(messages, from, messagesId, messagesIdReverse, dateTime) {
  // Güncelleme yapılacak mesaj ID'sini belirle
  const query = firstUser.messages.includes(messagesId) ? messagesId : messagesIdReverse;
  return Message_List.findOneAndUpdate(
    { messages_id: query },
    { $push: { data: { id: from, message: messages.text, type: messages.type, date: dateTime } } },
    { safe: true, upsert: true }
  ).exec();
}

// Yeni bir mesaj listesi oluştur
async function createNewMessageList(messages, from, to, messagesId, dateTime) {
  // Kullanıcıların mesaj listesine yeni ID'yi ekle
  await updateUserMessages(from, messagesId);
  await updateUserMessages(to, messagesId);

  // Yeni mesaj verisini oluştur ve kaydet
  const data = [{ id: from, message: messages.text, type: messages.type, date: dateTime }];
  const message = new Message_List({ messages_id: messagesId, first_user_id: from, second_user_id: to, data });

  return message.save();
}

// Kullanıcı bilgilerini almak için fonksiyon
async function getUserInfo(userId) {
  return User.findById(userId).exec();
}

// Kullanıcının mesaj listesine yeni mesaj ID'sini ekle
async function updateUserMessages(userId, messagesId) {
  return User.updateOne(
    { _id: userId },
    { $push: { messages: messagesId } }
  ).exec();
}

// Kullanıcıyı bildirimle bilgilendir
// async function notifyUser(message, oneSignalId, firstUser, secondUser) {
//   const notification = {
//     contents: { 'tr': message, 'en': message },
//     include_player_ids: [oneSignalId],
//     data: {
//       user: { id: firstUser._id, name: firstUser.username, photo: firstUser.photo },
//       me: { id: secondUser._id, gender: secondUser.gender },
//       additional: "chat"
//     },
//     headings: {
//       en: `${firstUser.username} sent you a message:`,
//       tr: `${firstUser.username} size mesaj gönderdi:`
//     }
//   };

//   // Bildirimi OneSignal ile gönder
//   oneSignal(notification);
// }

// Fonksiyonu dışa aktar
exports.addToDatabase = addToDatabase;
