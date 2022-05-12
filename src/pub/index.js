import express from 'express';
import { expressjwt } from 'express-jwt';
import BaseError from '../model/Error.js';
import { getHost } from '../wellknown/finger.js';
import { JwksClient } from 'jwks-rsa';

export default (app, db) => {
    const route = express.Router();

    //pub receiver route
    var getSecret = async function (req, token) {
        const issuer = token.payload.iss;
        const client = new JwksClient({
            jwksUri: issuer + '/.well-known/jwks.json',
            timeout: 10000 // 10s
        });

        const signingKey = await client.getSigningKey();

        return signingKey.publicKey;
    };

    route.use(expressjwt({ secret: getSecret, algorithms: ["RS256"] }))
    route.post("/", async (req, res, next) => {
        try {
            const to = new URL(getHost());
            let u2 = new URL(req.body.actor);
            const senderAddress = req.body.from.name + "@" + u2.host;
            const name = req.body.to.name;


            console.log("New Message from: " + senderAddress);
            let check = await queryGetOnce(db, "doesUserExist", {
                ":username": decodeURIComponent(name)
            });

            if (check.ex) {
                const qparams = {
                    ":fromUser": senderAddress,
                    ":toUser": decodeURIComponent(name) + "@" + to.host,
                    ":textBody": encodeURIComponent(req.body.object.content),
                    ":timestamp": Date.now()
                }

                let dbresponse = await querySet(db, "sendMessageToLocalUserInbox", qparams);

                console.log(qparams);
                console.log(dbresponse);

                next({})
            } else {
                next(new BaseError("User not found", 404))
            }
        } catch (e) {
            // console.error(e);
            next(new BaseError("The supplied pub activity is not in the correct format", 400));
        }
    });

    if (process.env.DISABLE_FEDERATION != "true") {

        // export const verifyRemoteJwt = expressjwt({ secret: verifyRemoteJwtJWKS, algorithms: ["HS256"] })

        app.use("/pub", route);
    }
}