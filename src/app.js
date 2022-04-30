
import express from "express";
import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';
import MyRoute from "./MyRoute.js";

const app = express();
const port = process.env.PORT || 8080;

if (process.env.NODE_ENV == "prod") {
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

    app.use(jwtCheck);
}

MyRoute(app);

app.listen(port, () => {
    console.log("listening on port " + port);
})
