"use strict";

const express = require("express");
const router = express.Router();
const admin = require("../config").admin;
const User = require("../models/users");
const jwt = require("jsonwebtoken");

//twillo
const twilio = require("twilio");
const accountSid = "AC61d048c428b979c68e365afe25c5a2ae";
const authToken = "8db9f1f604fc6648d58a2fb6e39e1e02";
const twilioClient  = twilio(accountSid, authToken);
const verifySid = "MG13188195b9c25a668246331a15d8e63e"; // Replace with your actual Twilio Verify SID


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
        // Validate phone number format
        if (!/^(\+|00)\d{1,3}\d{7,15}$/.test(number)) {
            return res.json({ status: false, message: "Invalid phone number format. Please use E.164 format." });
        }
        
        // Check if the user exists
        const existingUser = await User.findOne({ number });
        if (existingUser) {
            const result = await sendVerificationCode(number);
            return res.json(result);
        }

        // Create a new user
        const userRecord = await admin.auth().createUser({ phoneNumber: number });
        const newUser = new User({ number, uid: userRecord.uid });
        await newUser.save();

        // Send verification code
        const result = await sendVerificationCode(number);
        res.json(result);
    } catch (error) {
        console.error("Error in registration:", error);
        res.json({ status: false, error: error.message });
    }
});


// Verify code and login
router.post("/verify-code", async (req, res) => {
    try {
        const { number, verificationCode } = req.body;

        // Check if user exists
        const user = await User.findOne({ number });
        if (!user) return res.json({ status: false, message: "User not found" });

        // Verify the code with Twilio
        const { status } = await twilioClient.verify.v2.services(verifySid).verificationChecks.create({
            to: number,
            code: verificationCode
        });

        if (status !== "approved") return res.json({ status: false, message: "Incorrect verification code" });

        // Create a JWT token for the user
        const token = jwt.sign({ id: user._id }, req.app.get("api_secret_key"));
        res.json({ status: true, token, id: user._id });
    } catch (error) {
        console.error("Error verifying code:", error);
        res.json({ status: false, error: error.message });
    }
});

module.exports = router;
