"use strict";

const express = require("express");
const router = express.Router();
const admin = require("../config").admin;
const User = require("../models/users");
const jwt = require("jsonwebtoken");

// Doğrulama kodu gönderme
router.post("/send-code", async (req, res) => {
    try {
        const { number } = req.body;

        // Kullanıcıyı kontrol et
        const user = await User.findOne({ number });
        if (!user) return res.json({ status: false, message: "Kullanıcı bulunamadı" });

        // Firebase Authentication ile SMS doğrulama kodu gönder
        const verificationId = await admin.auth().createCustomToken(number);
        
        // Kullanıcının doğrulama kodunu güncelle
        user.verificationCode = verificationId; 
        await user.save();

        res.json({ status: true, message: "Doğrulama kodu gönderildi", verificationId });
    } catch (err) {
        res.json({ status: false, error: err.message });
    }
});

// Doğrulama kodu kontrolü ve oturum açma
router.post("/verify-code", async (req, res) => {
    try {
        const { number, verificationCode } = req.body;

        // Kullanıcıyı kontrol et
        const user = await User.findOne({ number });
        if (!user) return res.json({ status: false, message: "Kullanıcı bulunamadı" });

        // Doğrulama kodunu kontrol et
        if (user.verificationCode !== verificationCode) {
            return res.json({ status: false, message: "Doğrulama kodu hatalı" });
        }

        // Kullanıcıya JWT token oluştur
        const token = jwt.sign({ id: user._id }, req.app.get("api_secret_key"));
        res.json({ status: true, token, id: user._id });
    } catch (err) {
        res.json({ status: false, error: err.message });
    }
});

// Kullanıcı kaydı
router.post("/register", async (req, res) => {
    try {
        const { number } = req.body;

        const userRecord = await admin.auth().createUser({
            phoneNumber: number,
        });

        const newUser = new User({ number });
        await newUser.save();

        res.json({ status: true, userId: userRecord.uid });
    } catch (error) {
        res.json({ status: false, error: error.message });
    }
});

module.exports = router;
