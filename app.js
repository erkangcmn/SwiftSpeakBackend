"use strict";

const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const http = require("http");
const config = require("./config");
const verifyToken = require("./middleware/verifytoken");
const cors = require("cors");
const mongoose = require("mongoose");

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:19006", optionsSuccessStatus: 200 }));

// API anahtarını ayarla
app.set("api_secret_key", config.api_secret_key);

// Database bağlantısı
mongoose.set("strictQuery", false);

mongoose.connect("mongodb+srv://erkangocmn:GKaCMKeBk8eufIFH@swiftspeak.byjgzea.mongodb.net/?retryWrites=true&w=majority&appName=SwiftSpeak")
    .then(() => console.log("MongoDB: connected"))
    .catch((err) => console.log("MongoDB: error", err));
mongoose.connection.on("open", () => { console.log("MongoDB: connected"); });
mongoose.connection.on("error", (err) => { console.log("MongoDB:", err); });

// Routes
const Authenticate = require("./routes/authenticate");
const Home = require("./routes/home");

// Route kullanımı
app.use("/", Authenticate);
app.use("/api/", verifyToken);
app.use("/api/", Home);

// Sunucuyu başlat
app.listen(3031, () => {
    console.log(`Server listening on port ${3031}`);
});

module.exports = app;
