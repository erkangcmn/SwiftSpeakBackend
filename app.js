"use strict";

const express = require('express');

const app = express();




//pages
const Home = require("./routes/Home");


app.use("/api/", Home);

app.listen(80, () => { // server
    console.log("express server çalıştı");
});
