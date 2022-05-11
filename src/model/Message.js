import mysql from 'mysql2';

/**
 * @deprecated
 */
export default class BananaMessage {
    constructor(message, from, to) {
        this.message = message;
        this.from = from;
        this.to = to;
    }

    /**
     * Returns the status message for this message
     * @returns 
     */
    toJSON() {
        return {
            "status": "ok"
        }
    }
}