import express from 'express';
import { expressjwt } from 'express-jwt';
import BaseError from '../model/Error.js';
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

    route.use(expressjwt({ secret: getSecret, algorithms: ["RS256"] }));

    route.post("/", async (req, res, next) => {
        // console.log(req.body);
        const parsedMessage = BananaExternalMessage.createFromRequest(req);
        addMessageToConversation(db, parsedMessage, next);
    });

    if (process.env.DISABLE_FEDERATION != "true") {
        app.use("/pub", route);
    }
}

export async function addMessageToConversation(db, message, next) {
    console.log("New Message from: " + message.from);
    // console.log(message);

    const conversationExists = await queryGetOnce(db, "doesConvoExist", {
        ":conversationId": message.conversationId
    });

    const doesUserParticipateInConversation = await queryGetOnce(db, "doesUserParticipateInConversation", {
        ":convId": message.conversationId,
        ":userUri": message.from
    })

    if (conversationExists.ex) {
        if (doesUserParticipateInConversation.ex) {

            const msg = await querySet(db, "addMessageToLocalConvo", {
                ":conversationId": message.conversationId,
                ":fromUser": message.from,
                ":textBody": message.body,
                ":timestamp": Date.now()
            });

            // console.log(msg);
            next({});
        } else {
            next(new BaseError("Cannot send message - you are not a member of the conversation"));
        }
    } else {
        //create new conversation
        // console.log(message)
        const convo = await querySet(db, "createNewLocalConvo", {
            ":startedBy": message.from
        });

        message.recipients.map(async e => {
            await querySet(db, "addUserToLocalConvo", {
                ":conversationId": convo.lastID,
                ":userUri": e
            });
        });

        //add new message to created convo:
        const newMsg = await querySet(db, "addMessageToLocalConvo", {
            ":conversationId": convo.lastID,
            ":fromUser": message.from,
            ":textBody": message.body,
            ":timestamp": Date.now()
        });

        console.log(newMsg);

        //TODO send push notification here

        next({})
    }
}