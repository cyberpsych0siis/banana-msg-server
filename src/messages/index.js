import express from 'express';
import { queryGet, queryGetOnce, querySet } from '../connector/database.js';
import { getJwtConfig } from '../jwt/config.js';
import BaseError from '../model/Error.js';

export default (app, db) => {
    const route = express.Router();

    route.use(getJwtConfig());

    //sends back the current inbox for user req.auth.sub
    route.get("/inbox", async (req, res, next) => {
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

    //Represents the activitypub inbox for the user :user
    route.post("/:user", async (req, res, next) => {
        const from = req.auth.sub;
        const issuer = req.auth.iss;
        const to = req.params.user;
        const { msg } = req.body;

        // let originString = new URL(`acct:${from}`)

        let check = await queryGetOnce(db, "doesUserExist", {
            ":username": to
        });

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
        }
    });

    app.use("/messages", route);
}