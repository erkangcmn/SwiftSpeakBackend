"use strict";

const express = require("express"),
    router = express.Router(),
    bcrypt = require("bcryptjs"),
    jwt = require("jsonwebtoken");

const User = require("../models/users"); //user database yapısını dahil ettik

router.post("/register", async (req, res) => {
    try {
        const { number, name, password } = req.body;

        if (await User.findOne({ number })) return res.json({ status: false, message: "Bu numaraya ait bir hesap zaten var" });

        const hash = await bcrypt.hash(password, 10);
        const savedUser = await new User({ email, name, phone, company, password: hash }).save();

        const token = jwt.sign({ id: savedUser._id }, req.app.get("api_secret_key"));

        res.json({ id: savedUser._id, token, status: true });
    } catch (err) {
        res.json(err);
    }
});


router.post("/login", async (req, res) => {
    try {
        const { number, password } = req.body;

        const user = await User.findOne({ number }).select("+password");
        if (!user) return res.json({ status: false, message: "Kullanıcı bulunamadı" });

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.json({ stauts: false, message: "Şifreniz hatalı" });

        const token = jwt.sign({ id: user._id }, req.app.get("api_secret_key"));
        res.json({ status: true, token, id: user._id });

    } catch (err) {
        res.json(err);
    }
});

//TODO: Kullanıcı şifresini unutursa kontrol ve yeniden şifre güncellemesi gerekebilir
module.exports = router;
