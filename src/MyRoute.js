import express from "express";
import Contact from "./model/Contact.js";
import BananaMessage from "./model/Message.js";
import SuccessMessage from "./success/SuccessMessage.js";
import mysql from 'mysql2';

export default (app) =>  {
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

    api.get("/contacts", (req, res) => {

        sql.query(
            `SELECT friend2.publicKey as publicKey, friend2.username as username
            FROM usercontacts
            JOIN userKeys as friend1
            ON friend1.subject = usercontacts.user1
            JOIN userKeys as friend2
            ON friend2.subject = usercontacts.user2
            WHERE usercontacts.fetched = 0 AND friend1.subject = '?'`,
            [req.auth.sub],
            function(err, results) {
                if (err) {
                    console.error(err)
                    res.status(401).end();
                }

                console.log(results);

                res.status(200).send(results.map((v) => {
                    return new Contact(v.username, v.publicKey);
                })).end();

                sql.query(
                    `UPDATE usercontacts SET fetched = 1 WHERE user1 = ?`,
                    [req.auth.sub],
                    function(err, results) {
                        if (err) {
                            console.error(err);
                        }
                    }
                )
            }
        )
    });

    api.get("/inbox", (req, res) => {

    });

    api.post("/register_device", (req, res) => {
        console.log(req.body.username, req.auth.sub);

        sql.query(
            "INSERT INTO `userKeys`(`subject`, `username`, `publicKey`) VALUES ('?','?','?')",
            [req.auth.sub, req.body.username, req.body.privateKey],
            function(err, results) {
                if (err) {
                    res.status(401).end();
                }
                console.log(results);
                res.status(200).end();
            }
          );
    });

    app.use("/", api);
}
