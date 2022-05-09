import BaseError from "../model/Error.js";

export class RegistrationError extends BaseError {
    constructor(msg) {
        super(msg);
    }
}