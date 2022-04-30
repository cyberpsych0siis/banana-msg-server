import express from "express";
import Contact from "./model/Contact.js";
import BananaMessage from "./model/Message.js";
import SuccessMessage from "./success/SuccessMessage.js";

export default (app) =>  {
    const api = express.Router();

    api.post("/send", express.json(), (req, res) => {
        const { message, from, to } = req.body;

        const msg = new BananaMessage(message, from, to);
        console.log(msg);
        const success = new SuccessMessage(req, res, msg);
    });

    api.get("/contacts", (req, res) => {
        console.log("Contacts for subject", req.auth.sub);
        const contact = new Contact();
        console.log(contact);
        res.send(JSON.stringify([contact])).end();
    });

    api.get("/inbox", express.json(), (req, res) => {

    });

    app.get("/keys", (req, res) => {
        res.send({
            "public": "public key here",
            "private": "private key goes here"
        });
    });

    app.use("/", api);
}
