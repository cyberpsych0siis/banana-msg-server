export default class BananaExternalMessage {

    type = "message";

    constructor(sender, receiver, subject, body) {
        this.from = sender;
        this.to = receiver;
        this.subject = subject;
        this.senderUsername = "@" + sender.split("@").filter(e => e != '')[0]
        console.log(receiver.split("@"));
        this.receiverUsername = "@" + receiver.split("@").filter(e => e != '')[0]
        this.body = body.msg;
    }

    static fromObject(obj) {
        console.log(obj);
        const { from: sender, to: receiver, subject, msg: body } = obj;
        return new BananaExternalMessage(sender, receiver, subject, body);
    }

    static fromJson(msgJson) {
        return BananaExternalMessage.fromObject(JSON.parse(msgJson));
    }

    toJSON() {
        return {
            "from": this.from,
            "to": this.to,
            "subject": this.subject,
            "body": this.body
        };
    }
}