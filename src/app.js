import fs from 'fs';
import express from "express";

import MyRoute from "./root.js";
import dotenv from 'dotenv';

import morgan from 'morgan';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

/* Use JSON by default */
app.use(express.json())

/* HTTP Logger */
app.use(morgan('dev'));

/* Add Root Route here */
MyRoute(app);

/* REST-Interface Proxy */
app.use((response, req, res, next) => {
    let success = !(response instanceof Error)
    let successData = null;
    let errorData = null;

    if (response instanceof Error) {
        res.status(response.status ?? 500);
        errorData = response;
        console.log(errorData);
    } else {
        res.status(200);
        successData = response;
        console.log(successData);
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