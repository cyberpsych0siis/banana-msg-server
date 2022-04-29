import express from "express";
import MalformedMessageError from "./errors/MalformedMessageError.js";
import Contact from "./model/Contact.js";
import session from 'header-session';
const app = express();

app.use(session())

app.listen(8080, () => {
    console.log("listening on port 8080");
})