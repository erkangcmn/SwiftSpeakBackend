"use strict";

const express = require("express");
const router = express.Router();
const admin = require("../config").admin;
const User = require("../models/users");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
    try {
        const { number } = req.body;

        // E.164 formatında telefon numarasını kontrol et
        if (!/^(\+|00)\d{1,3}\d{7,15}$/.test(number)) {
            return res.json({ status: false, message: "Geçersiz telefon numarası formatı. Lütfen E.164 formatını kullanın." });
        }

        // Kullanıcıyı kontrol et
        const existingUser = await User.findOne({ number });
        console.log("Checking for user with number:", number);
        
        const verificationCode = generateVerificationCode();

        if (existingUser) {
            // Kullanıcı mevcutsa, doğrulama kodunu mevcut kullanıcıya gönder
            await admin.auth().sendVerificationCode(number, verificationCode);
            return res.json({ status: true, message: "Bu telefon numarası zaten kayıtlı. Doğrulama kodu gönderildi.", userId: existingUser.uid });
        }

        // Kullanıcıyı oluştur
        const userRecord = await admin.auth().createUser({
            phoneNumber: number,
        });

        const newUser = new User({ number, verificationCode, uid: userRecord.uid });
        await newUser.save();

        // Doğrulama kodunu SMS olarak gönder
        await admin.auth().sendVerificationCode(number, verificationCode);

        res.json({ status: true, message: "Kullanıcı başarıyla kaydedildi, doğrulama kodu gönderildi.", userId: userRecord.uid });
    } catch (error) {
        res.json({ status: false, error: error.message });
    }
});

// Rastgele doğrulama kodu oluşturma fonksiyonu
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}



// Doğrulama kodu kontrolü ve oturum açma
router.post("/verify-code", async (req, res) => {
    try {
        const { number, verificationCode } = req.body;

        // Kullanıcıyı kontrol et
        const user = await User.findOne({ number });
        if (!user) return res.json({ status: false, message: "Kullanıcı bulunamadı" });

        // Doğrulama kodunu kontrol et
        const checkCode = user.verificationCode === verificationCode;
        if (!checkCode) {
            return res.json({ status: false, message: "Doğrulama kodu hatalı" });
        }

        // Kullanıcıya JWT token oluştur
        const token = jwt.sign({ id: user._id }, req.app.get("api_secret_key"));
        res.json({ status: true, token, id: user._id });
    } catch (err) {
        res.json({ status: false, error: err.message });
    }
});

module.exports = router;
