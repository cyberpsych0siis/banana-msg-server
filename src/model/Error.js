export default class BaseError {
    constructor(errormessage) {
        // this.success = false;
        this.errortitle = errormessage;
        this.errorcode = -1; //GENERAL ERROR
    }
}