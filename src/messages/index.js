import express, { json } from 'express';
import { queryGet, queryGetOnce, querySet } from '../connector/database.js';
import { getJwtConfig } from '../jwt/config.js';
import BaseError from '../model/Error.js';
import { getHost } from '../wellknown/finger.js';
import fetch from 'node-fetch';

export default (app, db) => {
    const route = express.Router();

    route.post("/", async (req, res, next) => {

    });

    //sends back the current inbox for user req.auth.sub
    route.get("/inbox", getJwtConfig(), async (req, res, next) => {
        console.log(req.auth.sub);
        let data = await queryGet(db, "selectMessagesForUser", {
            ":forUser": req.auth.sub
        });

        await querySet(db, "setChecked", {
            ":forUser": req.auth.sub
        })

        console.log(data);
        next(data);
    });


    /* 
{
  "@context": "https://www.w3.org/ns/activitystreams",
  "id": "http://example.org/foo",
  "type": "Note",
  "name": "My favourite stew recipe",
  "attributedTo": {
    "id": "http://joe.website.example/",
    "type": "Person",
    "name": "Joe Smith"
  },
  "published": "2014-08-21T12:34:56Z"
}
    */

    //Represents the sender activitypub endpoint (which has to be secured)
    route.post("/acct:@:user", getJwtConfig(), async (req, res, next) => {
        const from = req.auth.sub;
        const issuer = req.auth.iss;
        const to = new URL("acct://" + req.params.user);
        const { msg } = req.body;

        let u2 = new URL(getHost());
        if (to.host == u2.host) {
            console.log("Stay internal");
            let check = await queryGetOnce(db, "doesUserExist", {
                ":username": to
            });

            if (check.ex) {
                let issuerUrl = new URL(issuer);
                let completeIssuerUrl = new URL(`acct:${from}@${issuerUrl.hostname}`)
    
                let data = await querySet(db, "sendMessageToLocalUserInbox", {
                    ":fromUser": completeIssuerUrl.toString(),
                    ":toUser": to,
                    ":textBody": msg,
                    ":timestamp": Date.now()
                });
    
                console.log(data);
                console.log(completeIssuerUrl.toString(), to, msg);
    
                console.log(`Origin: acct:${from}@${issuerUrl.hostname}`)
                next({})
            } else {
                next(new BaseError("User not found"))
            }
        } else {
            console.log("Go extern");
            const strippedFromPath = req.url.substring(1);
            console.log(strippedFromPath);
            const response = await fetch('https://' + to.host + `/.well-known?resource=${strippedFromPath}`)
            console.log(response.status);
            if (response.status == 404) {
                next(new BaseError("User not found"))
            } else {
                const jsonData = response.json()
                console.log(jsonData);
                let sliced = jsonData.links.filter((entry) => {
                    return entry.type == "application/activity+json"
                });

                if (sliced.length == 1) {
                    sliced = sliced[0];
                    
                    fetch(sliced.href, {method: "POST", body: msg.body}).then((data) => {
                        console.log(data);
                        next({});
                    })
                } else {
                    next(new BaseError("User not found"))
                }
            }
        }


        // console.log(to, u2.host);

        // let originString = new URL(`acct:${from}`)

        /* 

        if (check.ex) {

            let issuerUrl = new URL(issuer);
            let completeIssuerUrl = new URL(`acct:${from}@${issuerUrl.hostname}`)

            // console.log(completeIssuerUrl)


            let data = await querySet(db, "sendMessageToLocalUserInbox", {
                ":fromUser": completeIssuerUrl.toString(),
                ":toUser": to,
                ":textBody": msg,
                ":timestamp": Date.now()
            });

            console.log(data);
            console.log(completeIssuerUrl.toString(), to, msg);

            console.log(`Origin: acct:${from}@${issuerUrl.hostname}`)
            next({})
        } else {
            next(new BaseError("User not found"))
        } */
    });

    app.use("/messages", route);
}