import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';
import { getKID } from './jwks.js';

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

export async function createToken(subject) {
    const jwksClient = jwks({
        jwksUri: process.env.JWT_ISSUER + "/.well-known/jwks.json",
    });

    // console.log(getJwtConfig());

    try {
        const key = await jwksClient.getSigningKey(getKID())
    } catch (e) {
        console.log(e);
        // return null;
    }
/*     return {
        "token": jwt.sign({
            // algorithm: "HS256",
            algorithm: "RS256",
            sub: subject,
            aud: process.env.JWT_AUDIENCE,
            iss: process.env.JWT_ISSUER
            // username: 
        }, getJWTSecret())
    }; */

    // let jwks_ = await readJWKFromPEM(privateKeyName);
    // jwks.read
}

export function getJwtConfig() {
    return expressjwt({
        secret: getJWTSecret(),
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
        // algorithms: ["HS256"]
        algorithms: ["RS256"]
    })
}