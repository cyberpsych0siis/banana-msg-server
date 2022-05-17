import express from 'express';
import { queryGet, querySet } from '../connector/database.js';
import { getJwtConfig } from '../jwt/config.js';
import BaseError from '../model/Error.js';
import BananaExternalMessage from '../model/ExternalMessage.js';
import { addMessageToConversation } from '../pub/index.js';
import { sendExternalMessage } from '../lib/federation.js';
// import conversations from './conversations.js';

export default (app, db) => {
    const route = express.Router();

    //sends back the current inbox for user req.auth.sub
    route.get("/inbox", getJwtConfig(), async (req, res, next) => {
        let data = await queryGet(db, "getMessagesForUser", {
            ":userUri": req.auth.sub + "@" + (new URL(req.auth.iss).host)
        });

        data = data.map((e) => {
            // console.log(e);
            e.textBody = decodeURIComponent(e.textBody)

            querySet(db, "setChecked", {
                ":messageId": e.messageId
            });

            return e;
        });

        next(data);
    });

    route.post("/:conversationId", getJwtConfig(), async (req, res, next) => {
        const senderUri = req.auth.sub + "@" + (new URL(req.auth.iss)).host;
        const { body } = req.body;

        if (process.env.DISABLE_FEDERATION == "true") {

        } else {
            console.log(req.params.conversationId);

            let usersInConversation = await queryGet(db, "getUserIdsInConversation", {
                ":conversationId": req.params.conversationId
            })
            
            usersInConversation = usersInConversation.map(e => {
                return e.userUri
            });
            console.log(usersInConversation);

            const externalMessage = new BananaExternalMessage(senderUri, req.params.conversationId, body, usersInConversation)
            sendExternalMessage(req.headers.authorization, externalMessage, next);
        }
    });

    /**
     *
     * {
        "conversationId": null,
        "recipients": ["@root@localhost:8080, ..."],
        "body": "Hello man"
    }
     */
    route.post("/", getJwtConfig(), (req, res, next) => {
        const senderUri = req.auth.sub + "@" + (new URL(req.auth.iss)).host;
        const { body } = req.body;

        const externalMessage = new BananaExternalMessage(senderUri, null, body, req.body.recipients);
        if (process.env.DISABLE_FEDERATION == "true") {
            if (new URL(req.auth.iss).host != destination) {
                next(new BaseError("Can't send message to " + destination + "; Federation is disabled on this server"))
                return;
            } else {
                console.log("push message straight to local database (because federation is off)");

                addMessageToConversation(db, externalMessage, next);
            }
        } else {
            //check if sender is in recipients, if not simply add him

            // console.log(d);
            if (externalMessage.recipients.indexOf(senderUri) == -1) {
                externalMessage.recipients.push(senderUri);
            }

            sendExternalMessage(req.headers.authorization, externalMessage, next);
        }
    });
    
    //create a new conversation
    route.post("/old", getJwtConfig(), (req, res, next) => {
        //Who sends the message
        // const from = req.auth.sub;

        //Who can you trust that this message isn't forged
        const issuer = req.auth.iss;
        const senderUri = req.auth.sub + "@" + (new URL(issuer)).host;

        // console.log(req.body);

        // const destAddressIsValid = req.params.user.split("@").length == 2;

        // const externalMessage = new BananaExternalMessage(sendC, "not supported yet", req.body);
        const externalMessage = BananaExternalMessage.createFromRequest(req);
        if (req.body.body) {

            if (process.env.DISABLE_FEDERATION == "true") {
                if (new URL(issuer).host != destination) {
                    next(new BaseError("Can't send message to " + destination + "; Federation is disabled on this server"))
                    return;
                } else {
                    console.log("push message straight to local database (because federation is off)");

                    addMessageToConversation(db, externalMessage, next);
                }
            } else {
                //check if sender is in recipients, if not simply add him

                // console.log(d);
                if (externalMessage.recipients.indexOf(d) == -1) {
                    externalMessage.recipients.push(d);
                }

                sendExternalMessage(req.headers.authorization, externalMessage, next);
            }
        } else {
            next(new BaseError("Message didn't contain property body"))
        }
    });

    app.use("/messages", route);
}