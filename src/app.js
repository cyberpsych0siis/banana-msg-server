
import express from "express";
import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';
import MyRoute from "./MyRoute.js";

const app = express();
const port = process.env.PORT || 8080;

const jwtCheck = expressjwt({
      secret: jwks.expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: 'https://dev-v9nbdl6t.us.auth0.com/.well-known/jwks.json'
    }),
    audience: 'https://messaging.rillo5000.com',
    issuer: 'https://dev-v9nbdl6t.us.auth0.com/',
    algorithms: ['RS256']
});

app.use(jwtCheck);

MyRoute(app);

app.get('/authorized', function (req, res) {
    res.send('Secured Resource');
});

app.get("/", (req, res) => {
    res.send("ok");
});


app.listen(port, () => {
    console.log("listening on port " + port);
})