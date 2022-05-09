export default class SuccessMessage {
    constructor(req, res, data) {
        this.data = data;
        res.setHeader("Content-Type", "application/json");
        res.status(200).send(this.toString());
    }

    toString() {
        return JSON.stringify(this.data);
    }
}