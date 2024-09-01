"use strict";
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Message_List = require("../models/messages");
const User = require("../models/users");

// Get messages for a specific user
router.get("/messages", async (req, res) => { // Corrected path
    try {
        const { id } = req.query;
        console.log(id);
        const token = req.headers['x-access-token'];
        console.log(token)
        const decoded = jwt.verify(token, req.app.get('api_secret_key'));
console.log(decoded)//id ile decoded id aynı değil
        // Kullanıcıya erişim izni kontrolü
        if (decoded.id !== id) {
            return res.status(403).json({ status: false, message: "Erişim izni yok" });
        }

        const user = await User.findById(id).exec();
        if (!user) return res.json({ messages: [] });

        const userList = await Promise.all(user.messages.map(async (messageId) => {
            const otherUserId = messageId.split("_").find(uid => uid !== id);
            const otherUser = await User.findById(otherUserId).exec();
            return otherUser ? {
                id: otherUser._id,
                name: otherUser.name,
                messages: otherUser.messages
            } : null;
        }));

        // Boş olanları filtrele
        res.json({
            messages: userList.filter(user => user !== null)
        });
    } catch (err) {
        console.error('hata', err);
        res.status(500).json({ err });
    }
});

// Get messages from a specific message list
router.get("/message", async (req, res) => {
    try {
        const { number, id } = req.query;
        const messageList = await Message_List.findOne({ messages_id: id }).exec();
        if (messageList) {
            res.json({
                data: messageList.data,
                response: true,
            });
        } else {
            res.json({
                response: false,
            });
        }
    } catch (err) {
        res.json({
            response: false,
        });
    }
});

module.exports = router;
