"use strict";
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Message_List = require("../models/messages");
const User = require("../models/userInfo");

// Get messages for a specific user
router.get("/messages", async (req, res) => {
    try {
        const { id } = req.query;
        const token = req.headers['x-access-token'];
        const decoded = jwt.verify(token, req.app.get('api_secret_key'));

        // Kullanıcıya erişim izni kontrolü
        if (decoded.id !== id && !decoded.is_dating) {
            return res.json({ status: false });
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
        res.json({ err });
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
