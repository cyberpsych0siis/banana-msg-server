import fs from 'fs';
import express from "express";

import MyRoute from "./root.js";
// import webfinger from 'webfinger';
import dotenv from 'dotenv';

// import devices from './devices/index.js';
import morgan from 'morgan';
import BaseError from './model/Error.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json())
app.use(morgan('dev'));

/* Add Root Route here */
MyRoute(app);

/* Errorhandler */
app.use((response, req, res, next) => {
    console.log("hmm");

    let success = !(response instanceof BaseError)
    let successData = null;
    let errorData = null;

    if (response instanceof BaseError) {
        res.status(500);
        errorData = response;
        console.log(errorData);
    } else {
        // res.send(JSON.stringify(err))
        res.status(200);
        successData = response;
    }

    res.send(JSON.stringify({
        success: success,
        successData: successData,
        errorData: errorData
    }));
});

/* Let App Listen to port */
if (process.env.USE_SSL == "true") {
    var privateKey = fs.readFileSync(process.env.SSL_KEY_FILE ?? 'ssl/key.pem' );
    var certificate = fs.readFileSync(process.env.SSL_CERT_FILE ?? 'ssl/cert.pem' );

    https.createServer({
        key: privateKey,
        cert: certificate
    }, app).listen(port);
    console.log("listening on port " + port + " (SSL Enabled)");
} else {   
    app.listen(port, () => {
        console.log("listening on port " + port);
    });
}