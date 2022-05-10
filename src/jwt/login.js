import express from 'express';
import { queryGet, querySet } from '../connector/database.js';
import { createToken, getJwtConfig } from './config.js';
import bcrypt from 'bcrypt';
import BaseError from '../model/Error.js';

export default (app, db) => {
    const route = express.Router();

    route.post("/login", async (req, res, next) => {
        const { username, password } = req.body;
        try {
            let data = await queryGet(db, "checkUsername", {
                ":username": username
            });

            if (data.length == 0 || !bcrypt.compareSync(password, data[0].password)) {
                next(new BaseError("Username or password wrong"));
            } else {
                next(createToken(username))
            }
        } catch (e) {
            next(e);
        }
    });

    route.post("/logout", getJwtConfig(), (req, res, next) => {
        //invalidate jwt somehow here

        next({
            token: ""
        })
    });

    route.post("/register", async (req, res, next) => {
        const {
            username,
            password,
            publickey   //must be generated on the device and sent on registration
        } = req.body;

        const salt = bcrypt.genSaltSync(10);
        const pwHash = bcrypt.hashSync(password, salt);

        try {

            let data = await querySet(db, "registerUser", {
                ":username": username,
                ":pw": pwHash,
                ":b64publickey": publickey ?? "no pubkey"
            })
            console.log("New ID: " + data.lastID)
            next(createToken(username))
        } catch (e) {

            //error handler
            next(e);
        }
    });

    app.use("/", route);
}