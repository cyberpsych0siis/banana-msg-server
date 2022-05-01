import http from 'http';
import { getPort, getHost } from './finger'
import express from 'express';
import lookupIdentifier from './lookup';

const app = express();

lookupIdentifier(app);
//const server = http.createServer(webfingerListener);
//oh no, pleae
app.listen(getPort(), getHost(), () => {console.log("Webfinger instance running on " + getHost() + ":" + getPort())});