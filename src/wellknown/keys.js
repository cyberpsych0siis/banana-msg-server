import express from 'express';
import URL from 'url';
import { queryGetOnce } from '../connector/database.js';

export default (app, db) => {
    const route = express.Router();

    route.get("/keys", async (req, res) => {
        const query = new URLSearchParams(URL.parse(req.url).query);

        if (query.has("resource")) {

            const username = query.get("resource");

            let exist = await queryGetOnce(db, "doesUserExist", {
                ":username": username
            });

            if (exist.ex) {
                let key = await queryGetOnce(db, "getPubkey", {
                    ":username": username
                });
                // console.log(key);
                res.status(200).send(key);
            } else {
                res.status(404).end();
            }
        } else {
            res.status(400).end();
        }
    });

    app.use("/", route);
}