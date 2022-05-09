import express from "express";
import webfinger from 'webfinger';
import { getJwtConfig } from './jwt/config.js'
import BaseError from "./model/Error.js";
import login from "./jwt/login.js";
import profile from "./profile/index.js";
import { DatabaseConnector } from "./connector/DatabaseConnector.js";
import messages from "./messages/index.js";

export default (app, db, debug = false) => {
    const prefix = process.env.PREFIX || "/";
    const route = express.Router();
    // route.use()

    //make webfinger external?
    /* Init Webfinger here */
    // webfinger(app, db);

    login(route, db);
    // profile(route, db);
    messages(route, db);
    
    //Add routes here that you want to be enabled in development only
    if (process.env.NODE_ENV != "production" | debug) {

        route.get("/crash", (req, res, next) => {
            throw new BaseError("Hello");
        });

        route.get("/nocrash", getJwtConfig(), (req, res, next) => {
            next({
                "msg": "here for a crash free world"
            });
        });
    }

    app.use(prefix, route);

    /* REST-Interface Proxy */
    route.use((response, req, res, next) => {
    let success = !(response instanceof Error);
    let successData = null;
    let errorData = null;
    
    if (!success) {
        console.error(response)
        res.status(response.status ?? 500);
        errorData = { message: response.message, code: response.errno ?? -1 };
    } else {
        res.status(200);
        successData = response;
    }

    console.log(success, successData, errorData);

    res.send(JSON.stringify({
        success: success,
        successData: successData,
        errorData: errorData
    }));
});
}

    /* api.post("/send", (req, res) => {
        const { message, from, to } = req.body;

        const msg = new BananaMessage(message, from, to);
        console.log(msg);
        const success = new SuccessMessage(req, res, msg);
    });

    //Doesn't work
    api.get("/friend_request", (req, res) => {

        sql.query(
            `SELECT friend2.publicKey as publicKey, friend2.username as username
            FROM usercontacts
            JOIN userKeys as friend1
            ON friend1.subject = usercontacts.user1
            JOIN userKeys as friend2
            ON friend2.subject = usercontacts.user2
            WHERE usercontacts.fetched = 0 AND friend1.subject = ?`,
            [req.auth.sub],
            function (err, results) {
                if (err) {
                    console.error(err)
                    res.status(401).end();
                    return;
                }

                console.log(results);

                res.status(200).send(results.map((v) => {
                    return new Contact(v.username, v.publicKey);
                })).end();
            }
        )
    });

    //Doesnt work
    api.post("/friend_request", async (req, res) => {

        sql.query(
            'SELECT `username`, `subject` FROM `userKeys` WHERE `publicKey` = ?',
            [req.body.friend_id],
            function (err, results) {
                if (err) {
                    console.error(err);
                    res.status(401).end();
                    return;
                }

                if (results.length == 0) {
                    res.status(404).end();
                    return;
                }

                console.log(results);

                sql.query(
                    'INSERT INTO usercontacts(user1, user2) VALUES (?, ?)',
                    [req.auth.sub, results[0].subject],
                    function (err, results) {
                        if (err) {
                            console.error(err);
                            res.status(401).end();
                            return
                        }

                        console.log(results);

                        res.status(200).send({
                            "name": results[0].username,
                            "publicKey": req.body.foreignKey,
                            "status": 1
                        });
                    })
            }
        )
    });

    api.post("/friend_accept", async (req, res) => {
        let resp = 
        await SqlSingleton.query(`UPDATE usercontacts SET fetched = 1 WHERE user1 = ? AND user2 = ?`,
            [req.auth.sub, req.body.foreignKey]);

        if (resp) {
            res.status(200).end();
        } else {
            res.status(401).end();
        }
    })

    api.get("/inbox", (req, res) => {

    });*/

    // api.post("/register_device", async (req, res) => {


    // app.use("/api/v1", api);
