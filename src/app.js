import fs from 'fs';
import express from "express";
import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';
import MyRoute from "./MyRoute.js";
import webfinger from 'webfinger';
import dotenv from 'dotenv';
import MySQLDatabaseConnector, { SQliteDatabaseConnector } from "./connector/DatabaseConnector.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const jwtCheck = expressjwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.JWKS_URI
    }),
//    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER,
    algorithms: ['RS256']
});

app.use(express.json())

app.use(jwtCheck);

MyRoute(app);

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV == "dev") {
    webfinger(app, new SQliteDatabaseConnector())
} else {
    webfinger(app, new MySQLDatabaseConnector());
}

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