import express from 'express';
import DeviceRegistration from './DeviceRegistration';

export default (app) => {
    const route = express.Router();

    route.get("/", async (req, res, next) => {
        const { accountId } = req.auth;
        
        //new DeviceRegistration(accountId);
        next();
    });

    route.post("/register", async (req, res, next) => {
        console.log(req.body);
        // next();
        let resp = await SqlSingleton.query(
            "INSERT INTO `userKeys`(`subject`, `username`, `publicKey`) VALUES (?,?,?)",
            [req.auth.sub, req.body.username, req.body.publicKey]);

        if (resp) {
            next({
                "success": true
            });
        } else {
            res.status(401).end();
        }

        // res.end();

    });

    route.post("/unregister", (req, res) => {
        res.end();
    });

    app.use("/devices", route);
}