import express from 'express';

export default (app) => {
    const route = express.Router();

    //sends back the current inbox for user req.auth.sub
    route.get("/inbox", (req, res) => {
        res.end();
    });

    //Receives the message for userid ./:id
    route.post("/:id", (req, res, next) => {
        const from = req.auth.sub;
        const to = req.params.id;
        const body = req.body;
    });

    app.use("/messages", route);
}