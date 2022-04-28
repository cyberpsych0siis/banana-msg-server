export class BananaError extends Error {
    constructor(error, res) {
        super(error);

        res.setHeader("Content-Type", "application/json");
        if (!error instanceof Error) throw new Error("Not an error");

        Object.assign(this, error);
        console.log(this);

        this.message = "Malformed Message";
    }

    toString() {
        return {
            "message": this.message,
            "status": "fail"
        }
    }
}

export default class MalformedMessageError extends BananaError {
    constructor(e, res) {
        super(e, res);
    }
}