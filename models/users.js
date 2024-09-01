"use strict";

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true },
   // username: { type: String, required: true, unique: true },
    //oneSignalId: { type: String, required: true },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("user", userSchema);
