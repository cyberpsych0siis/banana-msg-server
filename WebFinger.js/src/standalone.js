import http from 'http';
import { getPort, getHost } from './finger.js'
import express from 'express';
import { lookupIdentifier } from './lookup.js';

const app = express();

lookupIdentifier(app);
//const server = http.createServer(webfingerListener);
app.listen(getPort(), getHost(), () => {console.log("Webfinger instance running on " + getHost() + ":" + getPort())});