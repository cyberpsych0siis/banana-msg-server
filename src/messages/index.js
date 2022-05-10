import express, { json } from 'express';
import { queryGet, queryGetOnce, querySet } from '../connector/database.js';
import { getJwtConfig } from '../jwt/config.js';
import BaseError from '../model/Error.js';
import { getHost } from '../wellknown/finger.js';
import fetch from 'node-fetch';
import ActivityPubMessage from '../model/ActivityPubMessage.js';

export default (app, db) => {
    const route = express.Router();

    //activitypub receiver route
    route.post("/", async (req, res, next) => {
        const to = new URL(getHost());
        let u2 = new URL(req.body.actor);
        const senderAddress = req.body.from.name + "@" + u2.host;
        const name = req.body.to.name;


        console.log(senderAddress);
        if (to.origin == u2.origin) {
            let check = await queryGetOnce(db, "doesUserExist", {
                ":username": decodeURIComponent(name)
            });

            if (check.ex) {
                await querySet(db, "sendMessageToLocalUserInbox", {
                    ":fromUser": senderAddress,
                    ":toUser": decodeURIComponent(name) + "@" + to.host,
                    ":textBody": req.body.object.content,
                    ":timestamp": Date.now()
                });

                next({})
            } else {
                next(new BaseError("User not found"))
            }
        }
    });

    //sends back the current inbox for user req.auth.sub
    route.get("/inbox", getJwtConfig(), async (req, res, next) => {
        // console.log(req.auth.sub);
        let data = await queryGet(db, "selectMessagesForUser", {
            ":forUser": req.auth.sub + "@" + req.auth.iss
        });

        await querySet(db, "setChecked", {
            ":forUser": req.auth.sub + "@" + req.auth.iss
        })

        // console.log(data);
        next(data);
    });

    //Represents the sending activitypub endpoint (which has to be secured)
    route.post("/acct:@:user", getJwtConfig(), async (req, res, next) => {
        const from = req.auth.sub;
        const issuer = req.auth.iss;
        const to = new URL("acct://@" + req.params.user);
        const { msg } = req.body;

        const senderProfile = issuer + "/profile/" + from;
        // console.log(senderProfile);
        const strippedFromPath = req.url.substring(1);
        // console.log(strippedFromPath);
        // const proto = process.env.NODE_ENV != "dev" ? "https" : "http";

        const webfingerRequestURI = 'https://' + to.host + `/.well-known/webfinger?resource=${strippedFromPath}`;
        console.log("[Webfinger] " + webfingerRequestURI);

        const response = await fetch(webfingerRequestURI)
        // console.log(response);
        if (response.status == 404) {
            next(new BaseError("User not found"))
        } else {
            const jsonData = await response.json();
            // console.log(jsonData);
            let sliced = jsonData.links.filter((entry) => {
                return entry.rel == "self" && entry.type == "application/activity+json"
            });

            let receiverProfile = jsonData.links.filter((entry) => {
                return entry.rel == "http://webfinger.net/rel/profile-page" && entry.type == "text/html"
            });

            const newMessage = new ActivityPubMessage(from, senderProfile, decodeURI(to.username), receiverProfile.href, msg)

            if (sliced.length == 1) {
                sliced = sliced[0];
                // console.log(sliced.href);

                fetch(sliced.href, {
                    method: "POST",
                    body: newMessage,
                    headers: {'Content-Type': 'application/json'},
                }).then((data) => {
                    // console.log(data);
                    next({});
                })
            } else {
                next(new BaseError("User not found"))
            }
        }
    });

    app.use("/messages", route);
}