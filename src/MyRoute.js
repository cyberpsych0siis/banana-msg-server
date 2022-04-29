import express from "express";
import BananaMessage from "./model/Message.js";
import SuccessMessage from "./success/SuccessMessage.js";

export default (app) =>  {
    const api = express.Router();
    app.use(express.json());

    api.post("/send", (req, res) => {
        const { message, from, to } = req.body;
        
        const msg = new BananaMessage(message, from, to);
        console.log(msg);
        const success = new SuccessMessage(req, res, msg);
    });

    api.get("/msg", (req, res) => {
        console.log(req.headers);
        res.send("Only authenticated clients get to see this. Congratulations!");
    })

    api.get("/contacts", (req, res) => {
        console.log(req.headers);
        console.log(req.session);
        const contact = {};
        console.log(contact);
        res.send(JSON.stringify([contact]));
    })

    api.get("/inbox", (req, res) => {

    })

    app.use("/my", api);
}