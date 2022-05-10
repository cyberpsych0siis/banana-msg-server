import express from 'express';
import webfinger from './finger.js';

export default (app, db) => {
    const route = express.Router();

    webfinger(route, db);

    app.use("/.well-known", route);
}