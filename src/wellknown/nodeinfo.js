import express from 'express';
import fs from 'fs';

export default (app, db) => {
    const route = express.Router();

    route.get("/", (req, res, next) => {
        const packageJson = JSON.parse(fs.readFileSync("package.json"));
        const federationEnabled = process.env.DISABLE_FEDERATION != "true"
        // console.log(packageJson.version);
        res.send({
            ver: packageJson.version, //version
            fed: federationEnabled, //federation
            
            dev: process.env.NODE_ENV != "production" //devmode
        })
    });

    app.use("/nodeInfo", route);
}