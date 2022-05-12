import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';
import { getPrivateKey } from './jwks.js';

/* export default (app, config = null) => {
    app.use(expressjwt(config || {
        secret: jwks.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: process.env.JWKS_URI
        }),
        issuer: process.env.JWT_ISSUER,
        algorithms: ['RS256']
    }));
} */

function getJWTSecret() {
    // return process.env.JWT_SECRET ?? "top secret"
    return jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.JWT_ISSUER + "/.well-known/jwks.json"
    })
}

export default (app) => {
    app.use(getJwtConfig());
}

export function createToken(subject) {
        const k = {
            "token": jwt.sign({
                sub: subject,
                aud: process.env.JWT_AUDIENCE,
                iss: process.env.JWT_ISSUER
            }, { key: getPrivateKey(), passphrase: "top secret"},
            { algorithm: "RS256" })
        };

        return k;
}

export function getJwtConfig() {
    return expressjwt({
        secret: getJWTSecret(),
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
        algorithms: ["RS256"]
    })
}