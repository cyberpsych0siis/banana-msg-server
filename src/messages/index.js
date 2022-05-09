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

    //Receives the message for userid :id
    route.post("/:user", async (req, res, next) => {
        const from = req.auth.sub;
        const issuer = req.auth.iss;
        const to = req.params.user;
        const { msg } = req.body;

        // let originString = new URL(`acct:${from}`)

        let check = await queryGetOnce(db, "doesUserExist", {
            ":username": to
        });

        // if (data.ex) {
        //     console.log(data);
        //     console.log(from, to, msg);
        //     next("ok");
        // } else {
        //     next(new BaseError("The requested user wasn't found"));
        // }
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

/*         let data = await querySet(db, "sendMessageToLocalUserInbox", {
            ":fromUser": "",
            ":toUser": "", 
            ":textBody": "",
            ":timestamp": ""
        }) */
    });

    app.use("/messages", route);
}