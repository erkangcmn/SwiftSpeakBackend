"use strict";

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true }, // Kullanıcının telefon numarası
    username: { type: String, required: true, unique: true }, // Kullanıcı adı
    //oneSignalId: { type: String, required: true }, // OneSignal kimliği
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Engellenen kullanıcı referansları
    createdAt: { type: Date, default: Date.now }, // Kullanıcının oluşturulma tarihi
    lastMessages: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Mesajlaştığı kullanıcının referansı
            lastMessage: { type: String }, // Son mesaj içeriği
            createdAt: { type: Date } // Son mesajın tarihi
        }
    ]
});

module.exports = mongoose.model("User", userSchema);
