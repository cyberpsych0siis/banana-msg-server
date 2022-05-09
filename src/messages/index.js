import express from 'express';
import { queryGetOnce } from '../connector/database.js';
import { getJwtConfig } from '../jwt/config.js';
import BaseError from '../model/Error.js';

export default (app, db) => {
    const route = express.Router();

    route.use(getJwtConfig());

    //sends back the current inbox for user req.auth.sub
    route.get("/inbox", (req, res) => {
        res.end();
    });

    //Receives the message for userid :id
    route.post("/:user", async (req, res, next) => {
        const from = req.auth.sub ?? req.params.from;
        const to = req.params.user;
        const { msg } = req.body;

        let data = await queryGetOnce(db, "doesUserExist", {
            ":username": to
        });

        if (data.ex) {
            console.log(data);
            console.log(from, to, msg);
            next("ok");
        } else {
            next(new BaseError("The requested user wasn't found"));
        }
    });

    app.use("/messages", route);
}