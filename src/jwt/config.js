import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';

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

export default (app) => {
    app.use(getJwtConfig());
}

export function createToken(subject) {
    return {
        "token": jwt.sign({
            algorithm: "HS256",
            sub: subject,
            aud: process.env.JWT_AUDIENCE,
            iss: process.env.JWT_ISSUER
            // username: 
        }, process.env.JWT_SECRET)
    };
}

export function getJwtConfig() {
    return expressjwt({
        secret: process.env.JWT_SECRET,
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
        algorithms: ["HS256"]
    })
}