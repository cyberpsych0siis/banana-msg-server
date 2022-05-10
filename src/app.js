import fs from 'fs';
import express from "express";

import root from "./root.js";
import dotenv from 'dotenv';

import morgan from 'morgan';
import login from './jwt/login.js';

import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
// import { webfingerListener } from './wellknown/finger.js';
import wellknown from './wellknown/index.js';

import https from 'https';
// import { setDb } from './connector/database.js';

/*import { Database, open } from 'sqlite' */

// const sqlite3 = require('sqlite3').verbose();

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

/* Use JSON by default */
app.use(express.json())

/* HTTP Logger */
app.use(morgan('dev'));

/* Add Root Route here */
open({
    filename: './db/default.db',
    driver: sqlite3.Database
}).then(db => {
    root(app, db);
    wellknown(app, db);
});

// })()


if (process.env.NODE_ENV == "dev") {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
}

/* Let App Listen to port */
if (process.env.USE_SSL == "true") {
    let privateKey, certificate;
    privateKey = fs.readFileSync(process.env.SSL_KEY_FILE ?? 'ssl/key.pem');
    certificate = fs.readFileSync(process.env.SSL_CERT_FILE ?? 'ssl/cert.pem');

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