"use strict";

const express = require("express");
const app = express();
const http = require("http");
const config = require("./config");
const verifyToken = require("./middleware/verifytoken");
const httpServer = http.createServer(app);
const cors = require("cors");
const mongoose = require("mongoose");


// Database bağlantısı
mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://erkangocmn:bPa6HdYUb5UllNdT@swiftspeak.kovaksa.mongodb.net/?retryWrites=true&w=majority&appName=swiftspeak")
    .then(() => console.log("MongoDB: connected"))
    .catch((err) => console.log("MongoDB: error", err));


// Routes
const Authenticate = require("./routes/authenticate");
const Home = require("./routes/home");


// Middleware
app.use(express.json({ limit: '10mb', extended: false }))
app.use(express.urlencoded({ limit: '10mb', extended: false }))
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

// Sunucuyu başlat
httpServer.listen(3031);
