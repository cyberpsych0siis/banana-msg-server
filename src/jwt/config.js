import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';

export default (app, config = null) => {
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
}
