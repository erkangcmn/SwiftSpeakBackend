"use strict";

const express = require("express");
const router = express.Router();
const admin = require("../config").admin;
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");

const accountSid = "AC61d048c428b979c68e365afe25c5a2ae";
const authToken = "8db9f1f604fc6648d58a2fb6e39e1e02";
const verifySid = "VA4d3aac8448d6d6d2671cdb7f53bd57e7";
const twilioClient = twilio(accountSid, authToken);

async function sendVerificationCode(number) {
    try {
        await twilioClient.verify.v2.services(verifySid).verifications.create({
            channel: "sms",
            to: number,
        });
        return { status: true, message: "Verification code sent." };
    } catch (error) {
        console.error("Error sending verification code:", error);
        return { status: false, error: error.message };
    }
}

router.post("/register", async (req, res) => {
    try {
        const { number } = req.body;

        if (!/^(\+|00)\d{1,3}\d{7,15}$/.test(number)) {
            return res.json({ status: false, message: "Telefon Numaranızı Lütfen Kontrol Ediniz!" });
        }

        const existingUser = await User.findOne({ number });
        if (existingUser) {
            const result = await sendVerificationCode(number);
            return res.json(result);
        }

        const userRecord = await admin.auth().createUser({ phoneNumber: number });
        const newUser = new User({ number, uid: userRecord.uid });
        await newUser.save();

        const result = await sendVerificationCode(number);
        res.json(result);
    } catch (error) {
        console.error("Error in registration:", error);
        res.json({ status: false, error: error.message });
    }
});

router.post("/verify-code", async (req, res) => {
    try {
        const { number, verificationCode } = req.body;
        
        const verification = await twilioClient.verify.v2.services(verifySid)
            .verificationChecks.create({ to: number, code: verificationCode });

        if (verification.status !== "approved") return res.json({ status: false, message: "Incorrect verification code" });

        const token = jwt.sign({ id: User._id }, req.app.get("api_secret_key"));
        res.json({ status: true, token, id: User._id });
    } catch (error) {
        console.error("Error verifying code:", error);
        res.json({ status: false, error: error.message });
    }
});

module.exports = router;
