import express from 'express';
import { queryGet, queryGetOnce, querySet } from '../connector/database.js';
import { getJwtConfig } from '../jwt/config.js';
import BaseError from '../model/Error.js';
import fetch from 'node-fetch';
// import ActivityPubMessage from '../model/ActivityPubMessage.js';
import BananaExternalMessage from '../model/ExternalMessage.js';
import { addMessageToDatabase } from '../pub/index.js';

export default (app, db) => {
    const route = express.Router();

    route.get("/all", getJwtConfig(), async (req, res, next) => {

        const hostpart = new URL(req.auth.iss).host;

        let data = await queryGet(db, "allMessagesForUser", {
            ":forUser": req.auth.sub
        });

        await querySet(db, "setChecked", {
            ":forUser": req.auth.sub
        });

        next(data);
    })

    //sends back the current inbox for user req.auth.sub
    route.get("/inbox", getJwtConfig(), async (req, res, next) => {

        let data = await queryGet(db, "selectMessagesForUser", {
            ":forUser": req.auth.sub
        });

        
        await querySet(db, "setChecked", {
            ":forUser": req.auth.sub
        })
        
        data = data.map((e) => {
            console.log(e);
            e.textBody = decodeURIComponent(e.textBody)
            return e;
        })

        console.log(data);

        next(data);
    });

    //Represents the sending activitypub endpoint
    route.post("/acct:@:user", getJwtConfig(), async (req, res, next) => {
        //Who sends the message
        const from = req.auth.sub;

        //Who can you trust that this message isn't forged
        const issuer = req.auth.iss;

        const destAddressIsValid = req.params.user.split("@").length == 2;
        
        if (destAddressIsValid) {
            const re = req.params.user.split("@")
            const [ usernameDest, destination ] = [
                "@" + re[0],
                re[1]
            ];
            
            const [ usernameFrom, from ] = [req.auth.sub, new URL(req.auth.aud).host]

            const [sendC, destC] = [
                usernameFrom + "@" + from,
                usernameDest + "@" + destination
            ];

            // console.log(usernameFrom, from, usernameDest, destination, sendC, destC);

            const externalMessage = new BananaExternalMessage(sendC, destC, "not supported yet", req.body);

            if (process.env.DISABLE_FEDERATION == "true" && (new URL(issuer).host != destination)) {
                next(new BaseError("Can't send message to " + destination + "; Federation is disabled on this server"))
                return;
            } else if (new URL(issuer).host == destination) {
                //push message to local stack
                console.log("push message to local stack");
                
                addMessageToDatabase(db, externalMessage, next);
            } else {
                //send message to remote server
                // console.log("send message to remote server");
                const webfingerRequestURI = 'https://' + destination + `/.well-known/webfinger?resource=acct:${destC}`;
                console.log("[Webfinger] " + webfingerRequestURI);

                const response = await fetch(webfingerRequestURI)

                if (response.status == 404) {
                    next(new BaseError("User not found", 404))
                } else {
                    const jsonData = await response.json();
                    // console.log(jsonData);
                    let sliced = jsonData.links.filter((entry) => {
                        return entry.rel == "self" && entry.type == "application/activity+json"
                    });
        
                    // let receiverProfile = jsonData.links.filter((entry) => {
                    //     return entry.rel == "http://webfinger.net/rel/profile-page" && entry.type == "text/html"
                    // });

                    if (sliced.length == 1) {
                        sliced = sliced[0];
        
                        if (process.env.DISABLE_FEDERATION != "true") {
                            fetch(sliced.href, {
                                method: "POST",
                                body: JSON.stringify(externalMessage),
                                headers: { 
                                    'Content-Type': 'application/json',
                                    'Authorization': `${req.headers.authorization}`
                                },
                            }).then((data) => {
                                next({});
                            })
                        } else {
                            next(new BaseError("User not found", 404));
                        }
                    } else {
                        next(new BaseError("User not found", 404))
                    }
            
                }
            }
        }
    });

    app.use("/messages", route);
}