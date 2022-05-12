import express from 'express';
import { expressjwt } from 'express-jwt';
import BaseError from '../model/Error.js';
import { getHost } from '../wellknown/finger.js';
import { JwksClient } from 'jwks-rsa';
import { queryGetOnce, querySet } from '../connector/database.js';
import BananaExternalMessage from '../model/ExternalMessage.js';

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
        console.log(req.body);
        const parsedMessage = BananaExternalMessage.fromJson(req.body);
        addMessageToDatabase(db, parsedMessage, next);
    });

    if (process.env.DISABLE_FEDERATION != "true") {

        app.use("/pub", route);
    }
}

export async function addMessageToDatabase(db, message, next) {
    console.log("New Message from: " + message.senderUsername);
    console.log("for: " + message.receiverUsername);
            let check = await queryGetOnce(db, "doesUserExist", {
                ":username": message.receiverUsername
            });

            if (check.ex) {
                const qparams = {
                    ":fromUser": message.from,
                    ":toUser": message.receiverUsername,
                    ":textBody": encodeURIComponent(message.body),
                    ":timestamp": Date.now()
                }

                let dbresponse = await querySet(db, "sendMessageToLocalUserInbox", qparams);

                console.log(qparams);
                console.log(dbresponse);

                next({})
            } else {
                next(new BaseError("User not found", 404))
            }
}