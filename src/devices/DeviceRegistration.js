import { DatabaseConnector } from "../connector/DatabaseConnector.js";

export default class DeviceRegistration extends DatabaseConnector {
    constructor(accountId) {
        console.log(accountId);
    }
}