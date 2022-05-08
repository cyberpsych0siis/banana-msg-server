export default class BaseError extends Error {
    constructor(errormessage) {
        super(errormessage);
        // this.success = false;
        this.errortitle = errormessage;
        this.errorcode = -1; //GENERAL ERROR
    }

    toJSON() {
        return this;
    }
}