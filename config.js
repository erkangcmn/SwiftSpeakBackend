"use strict";
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); 

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports={
    api_secret_key:'12<07>2024 sohbet uygulamasi <@< geliştiriyorum !',
    admin
}
