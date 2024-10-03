"use strict";

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Mesajı gönderen kullanıcı
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Mesajı alan kullanıcı
    content: { type: String, required: true }, // Mesajın içeriği (metin)
    createdAt: { type: Date, default: Date.now }, // Mesajın oluşturulma tarihi
    read: { type: Boolean, default: false } // Mesajın okunup okunmadığını takip etmek için
});

module.exports = mongoose.model("Message", messageSchema);
