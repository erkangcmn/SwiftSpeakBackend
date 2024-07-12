"use strict";
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).send("Token gereklidir");

    jwt.verify(token, req.app.get("api_secret_key"), (err, decoded) => {
        if (err) return res.status(500).send("Token geçersiz");
        req.userId = decoded.id;
        next();
    });
};
