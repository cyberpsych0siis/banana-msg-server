import express from 'express';
import BaseError from '../model/Error.js';
import { getHost } from '../wellknown/finger.js';

export default (app, db) => {
    const route = express.Router();

    //activitypub receiver route
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
        app.use("/pub", route);
    }
}