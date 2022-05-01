import express from "express";
import Contact from "./model/Contact.js";
import BananaMessage from "./model/Message.js";
import SuccessMessage from "./success/SuccessMessage.js";
import mysql from 'mysql2';

export default (app) => {
    const api = express.Router();

    const sql = mysql.createConnection({
        host: process.env.MYSQL_HOST ?? "localhost",
        user: process.env.MYSQL_USER ?? "root",
        password: process.env.MYSQL_PASS ?? "",
        database: process.env.MYSQL_DATABASE ?? "banana-msg"
    });

    api.post("/send", (req, res) => {
        const { message, from, to } = req.body;

        const msg = new BananaMessage(message, from, to);
        console.log(msg);
        const success = new SuccessMessage(req, res, msg);
    });

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

    app.post("/friend_request", (req, res) => {
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
    })

    app.post("/friend_accept", (req, res) => {
        sql.query(
            `UPDATE usercontacts SET fetched = 1 WHERE user1 = ? AND user2 = ?`,
            [req.auth.sub, req.body.foreignKey],
            function (err, results) {
                if (err) {
                    console.error(err);
                    res.status(401);
                    return
                }

                res.status(200).end();
            }
        )
    })

    api.get("/inbox", (req, res) => {

    });

    api.post("/register_device", (req, res) => {
        console.log(req.body);

        sql.query(
            "INSERT INTO `userKeys`(`subject`, `username`, `publicKey`) VALUES (?,?,?)",
            [req.auth.sub, req.body.username, req.body.publicKey],
            function (err, results) {
                if (err) {
                    console.error(err);
                    res.status(401).end();
                }
                console.log(results);
                res.status(200).end();
            }
        );
    });

    app.use("/", api);
}
