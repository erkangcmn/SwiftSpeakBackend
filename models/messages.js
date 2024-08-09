"use strict";

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String }, // Mesaj içeriği (metin veya fotoğraf URL'si)
    type: { type: String, enum: ['text', 'photo'], required: true }, // Mesaj türü (metin veya fotoğraf)
    createdAt: { type: Date, default: Date.now }, // Mesajın oluşturulma tarihi
    read: { type: Boolean, default: false } // Mesajın okunup okunmadığını takip etmek için
});

module.exports = mongoose.model("message", messageSchema);
