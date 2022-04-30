import { v4 } from "uuid";

export default class Contact {
    constructor(name, key) {
        this.name = name,
        this.publicKey = key
    }
}