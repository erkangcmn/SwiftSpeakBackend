"use strict";
const express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    http = require("http"),
    config = require("./config"), // token için yazdığımız config dosyasını dahil ettik
    verifyToken = require("./middleware/verifytoken"),
    cors = require("cors"),
    mongoose = require("mongoose");

app.use(express.json());
const corsOptions = {
    origin: "http://localhost:19006",
    optionsSuccessStatus: 200,
};
app.set("api_secret_key", config.api_secret_key); // token için oluşturduğumuz bilgiyi kullanmak için set ettik (kullanımı login.jsde app.get şeklinde kullandık)

//Database connect
mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://chatAppUser:Za6OgDCWERCBXu7v@chatapp.yyr4bcc.mongodb.net/?retryWrites=true&w=majority"); //veritabanı oluşturduk
mongoose.connection.on("open", () => { console.log("MongoDB: connected"); });
mongoose.connection.on("error", (err) => { console.log("MongoDB: error", err); });

// Pages
const Authenticate = require("./routes/authenticate");
const Home = require("./routes/home")

//Page Use
app.use("/", cors(corsOptions));
app.use("/", Authenticate);
app.use("/api/", verifyToken);
app.use("/api/", Home)



app.listen(3031, () => {
    console.log(`Server listening on port ${3031}`);
});
