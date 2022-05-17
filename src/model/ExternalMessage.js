export default class BananaExternalMessage {

    constructor(sender, convoId, msg, recipients) {
        this.from = sender;
        this.conversationId = convoId;
        this.body = msg;
        this.recipients = recipients;
    }

    getWebfingerAddresses() {
        // console.log(this.recipients);
        return this.recipients.map(f => {
            const split = f.split("@").filter(Boolean);
            // console.log(split);

            const proto = process.env.USE_SSL != "false" ? "https" : "http";
            return proto + '://' + split[1] + `/.well-known/webfinger?resource=acct:${f}`;
        });
    }

    static fromObject(obj) {
        // console.log(obj);
        const { from: sender, to: receiver, subject, body } = obj;
        return new BananaExternalMessage(sender, receiver, subject, body.msg);
    }

    static createFromRequest(obj) {
        const [usernameFrom, from] = [obj.auth.sub, new URL(obj.auth.aud).host]
        const sender = usernameFrom + "@" + from;
        const { conversationId, body, recipients } = obj.body;

        return new BananaExternalMessage(sender, conversationId, body, recipients);
    }

    static fromJson(msgJson) {
        return BananaExternalMessage.fromObject(JSON.parse(msgJson));
    }

    toJSON() {
        return {
            "conversationId": this.conversationId,
            "from": this.from,
            "body": this.body,
            "recipients": this.recipients
        }
    }
}