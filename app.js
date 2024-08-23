"use strict";

const express = require("express");
const app = express();
const http = require("http");
const config = require("./config");
const verifyToken = require("./middleware/verifytoken");
const httpServer = http.createServer(app);
const cors = require("cors");
const mongoose = require("mongoose");
const socketIO = require("socket.io"); // Import socket.io

// Initialize Socket.IO
const io = socketIO(httpServer); // Correctly instantiate socket.io
const nsp = io.of("/chats");
const messages = require("./services/messagesServices");

// Database bağlantısı
mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://erkangocmn:bPa6HdYUb5UllNdT@swiftspeak.kovaksa.mongodb.net/?retryWrites=true&w=majority&appName=swiftspeak")
    .then(() => console.log("MongoDB: connected"))
    .catch((err) => console.log("MongoDB: error", err));

// Routes
const Authenticate = require("./routes/authenticate");
const Home = require("./routes/home");

// Middleware
app.use(express.json({ limit: '10mb', extended: false }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
};

// API anahtarını ayarla
app.set("api_secret_key", config.api_secret_key);

// Route kullanımı
app.use("/", cors(corsOptions));
app.use("/", Authenticate);
app.use("/api/", verifyToken);
app.use("/api/", Home);

// Socket.IO
nsp.on("connection", (socket) => {
    const from = socket.handshake.query.from;
    const to = socket.handshake.query.to;
    
    socket.join(from + "_" + to); // Kullanıcının odasına katılmasını sağlar

    socket.on("getFromMobile", (message) => {
        const status = messages.addToDatabase(message, from, to);
        if (status) {
            nsp.to(to + "_" + from).emit("sendToMobile", message); // Karşı odadaki kullanıcıya mesaj gönderir
        }
    });
});

// Sunucuyu başlat
httpServer.listen(3031, () => {
    console.log('Server is listening on port 3031');
});
