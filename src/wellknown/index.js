import express from 'express';
import webfinger from './finger.js';
import keys from './keys.js';

export default (app, db) => {
    const route = express.Router();

    webfinger(route, db);
    keys(route, db);

    app.use("/.well-known", route);
}