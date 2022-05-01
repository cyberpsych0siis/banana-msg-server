
import express from "express";
import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';
import MyRoute, { sqlConnection } from "./MyRoute.js";
import webfinger from 'webfinger';
import dotenv from 'dotenv';

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

webfinger(app, sqlConnection);

app.listen(port, () => {
    console.log("listening on port " + port);
})
