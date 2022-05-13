import express from 'express';
import webfinger from './finger.js';
import keys from './keys.js';
import jwks from '../jwt/jwks.js';
import nodeInfo from './nodeinfo.js';

export default (app, db) => {
    const route = express.Router();

    webfinger(route, db);
    // keys(route, db);
    jwks(route);
    nodeInfo(route);

    app.use("/.well-known", route);
}