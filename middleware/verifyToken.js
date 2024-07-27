"use strict";
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(403).json({ message: "Token gereklidir" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(403).json({ message: "Geçersiz token formatı" });
    }

    jwt.verify(token, req.app.get("api_secret_key"), (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token geçersiz veya süresi dolmuş" });
        }
        req.userId = decoded.id;
        next();
    });
};
