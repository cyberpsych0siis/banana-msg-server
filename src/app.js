import express from "express";
import MalformedMessageError from "./errors/MalformedMessageError.js";
import Contact from "./model/Contact.js";
import BananaMessage from "./model/Message.js";
import SuccessMessage from "./success/SuccessMessage.js";
const app = express();

app.use(express.json());

app.post("/send", (req, res) => {
        const { message, from, to } = req.body;
        
        const msg = new BananaMessage(message, from, to);
        console.log(msg);
        const success = new SuccessMessage(req, res, msg);
});

app.get("/my/msg", (req, res) => {
    console.log(req.headers);
    res.send("Only authenticated clients get to see this. Congratulations!");
})

app.get("/my/contacts", (req, res) => {
    const contact = new Contact();
    console.log(contact);
    res.send(JSON.stringify([contact]));
})

app.listen(8080, () => {
    console.log("listening on port 8080");
})