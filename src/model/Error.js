export default class BaseError extends Error {
    constructor(errormessage, errorcode = -1) {
        super(errormessage);
        // this.success = false;
        this.errortitle = errormessage;
        this.errorcode = errorcode;
    }

    toJSON() {
        return this;
    }
}