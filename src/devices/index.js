import express from 'express';

export default (app) => {
    const route = express.Router();

    route.post("/register", async (req, res) => {
        // console.log(req.body);

        /* let resp = await SqlSingleton.query(
            "INSERT INTO `userKeys`(`subject`, `username`, `publicKey`) VALUES (?,?,?)",
            [req.auth.sub, req.body.username, req.body.publicKey]);

        if (resp) {
            res.status(200).send(JSON.stringify({
                "success": true
            }));
        } else {
            res.status(401).end();
        } */

        res.end();
    });

    route.post("/unregister", (req, res) => {
        res.end();
    });

    app.use("/devices", route);
}