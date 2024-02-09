"use strict";
const mongoose = require("mongoose"),
    Schema = mongoose.Schema;

const UserInfoSchema = new Schema({
    name: { type: String, required: true },
    number: { type: Number, required: true, unique: true },
    password: { type: String, required: true },
    photo: { type: String },
    onesignal: { type: String }
})


module.exports = mongoose.model("user", UserInfoSchema)
