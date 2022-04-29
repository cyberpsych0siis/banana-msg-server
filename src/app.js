import express from "express";
import MalformedMessageError from "./errors/MalformedMessageError.js";
import Contact from "./model/Contact.js";
import session from 'header-session';
import MyRoute from "./MyRoute.js";
const app = express();

app.use(session())

MyRoute(app);

app.listen(8080, () => {
    console.log("listening on port 8080");
})