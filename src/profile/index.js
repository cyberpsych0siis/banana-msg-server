import express from 'express';
import { queryGet } from '../connector/database.js';
// import { lookupIdentifier } from 'webfinger/src/lookup';
import { getJwtConfig } from '../jwt/config.js';

export default (app, db) => {
    const router = express.Router();

    router.use(getJwtConfig())

    app.get("/:id", (next, req, res) => {
        //proxy webfinger here?

        // res.end();
        // queryGet(db, )
    });

    app.get("/test", (req, res, next) => {
        next("works");
    })

    //Friend Request - doesnt work rn
    app.post("/:id/freq", (req, res) => {
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

    app.use("/profile", router);
}