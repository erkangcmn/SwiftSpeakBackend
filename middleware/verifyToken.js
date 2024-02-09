"use strict";
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
    const token = req.headers['x-access-token'];

    try {
        if (!token)throw new Error("Token bulunamadı!");  
        const decoded = await jwt.verify(token, req.app.get('api_secret_key'));
        req.decode = decoded;
        next();
        
    } catch (err) {
        res.json({
            status: false,
            message: err.message || "Token Geçersiz!"
        });
    }
};
