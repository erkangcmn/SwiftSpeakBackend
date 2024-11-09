"use strict";

const express = require("express");
const router = express.Router();
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");

const accountSid = "AC61d048c428b979c68e365afe25c5a2ae";
const authToken = "8db9f1f604fc6648d58a2fb6e39e1e02";
const verifySid = "VAfd8cc63dc3535cffbf26ec66b5569134";
const twilioClient = twilio(accountSid, authToken);

// Function to send a verification code using Twilio
async function sendVerificationCode(number) {
  try {
    console.log("1")
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

// Registration route
router.post("/register", async (req, res) => {
  try {
    const { number } = req.body;
    if (!/^(\+|00)\d{1,3}\d{7,15}$/.test(number)) {
      return res.json({ status: false, message: "Telefon Numaranızı Lütfen Kontrol Ediniz!" });
    }
    let existingUser = await User.findOne({ number });
    const result = await sendVerificationCode(number);
    res.json({ status: true, result, existingUser });
  } catch (error) {
    console.error("Error in registration:", error);
    res.json({ status: false, error: error.message });
  }
});

// Register username route for new users
router.post("/register-username", async (req, res) => {
  try {
    const { number, username } = req.body;
    const user = new User({ number, username });
    await user.save();
    res.json({ status: true, message: "User registered successfully." });
  } catch (error) {
    console.error("Error in username registration:", error);
    res.json({ status: false, error: error.message });
  }
});


// Verification route
router.post("/verify-code", async (req, res) => {
  try {
    const { number, verificationCode } = req.body;
    // Verify the code using Twilio
    const verification = await twilioClient.verify.v2.services(verifySid)
      .verificationChecks.create({ to: number, code: verificationCode });

    if (verification.status !== "approved") {
      return res.json({ status: false, message: "Incorrect verification code" });
    }

    // Retrieve the user from the database
    const user = await User.findOne({ number });
    if (!user) {
      return res.json({ status: false, message: "User not found" });
    }

    // Generate JWT token
    const payload = { id: user._id };
    console.log(payload)
    const token = jwt.sign(payload, req.app.get("api_secret_key"));
    console.log(token)
    res.json({ status: true, token, id: user._id });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.json({ status: false, error: error.message });
  }
});

module.exports = router;
