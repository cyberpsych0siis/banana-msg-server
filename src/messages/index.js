import express from 'express';
import { queryGet, queryGetOnce, querySet } from '../connector/database.js';
import { getJwtConfig } from '../jwt/config.js';
import BaseError from '../model/Error.js';
import BananaExternalMessage from '../model/ExternalMessage.js';
import { addMessageToConversation } from '../pub/index.js';
import { sendExternalMessage } from '../lib/federation.js';
// import conversations from './conversations.js';

export default (app, db) => {
    const route = express.Router();

/*     route.get("/all", getJwtConfig(), async (req, res, next) => {

        let data = await queryGet(db, "allMessagesForUser", {
            ":forUser": req.auth.sub
        });

        await querySet(db, "setChecked", {
            ":forUser": req.auth.sub
        });

        next(data);
    }) */

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

    //Represents the sending endpoint
    route.post("/send", getJwtConfig(), (req, res, next) => {
        //Who sends the message
        // const from = req.auth.sub;

        //Who can you trust that this message isn't forged
        const issuer = req.auth.iss;

        // console.log(req.body);

        // const destAddressIsValid = req.params.user.split("@").length == 2;

        // if (true) {
            // const externalMessage = new BananaExternalMessage(sendC, "not supported yet", req.body);
            const externalMessage = BananaExternalMessage.createFromRequest(req);

            if (process.env.DISABLE_FEDERATION == "true") {
                if (new URL(issuer).host != destination) {
                    next(new BaseError("Can't send message to " + destination + "; Federation is disabled on this server"))
                    return;
                } else {
                    console.log("push message straight to local database (because federation is off)");

                    // addMessageToDatabase(db, externalMessage, next);
                    addMessageToConversation(db, externalMessage, next);
                }
            } else {
                //check if sender is in recipients, if not simply add him
                const d = req.auth.sub + "@" + (new URL(issuer)).host;
                // console.log(d);
                if (externalMessage.recipients.indexOf(d) == -1) {
                    externalMessage.recipients.push(d);
                }

                sendExternalMessage(req.headers.authorization, externalMessage, next);
            }
        // }
    });

    app.use("/messages", route);
}