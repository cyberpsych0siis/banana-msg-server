export default class BananaExternalMessage {

    type = "message";

    constructor(sender, receiver, subject, body) {
        this.from = sender;
        this.to = receiver;
        this.subject = subject;
        this.senderUsername = "@" + sender.split("@").filter(e => e != '')[0]
        console.log(receiver.split("@"));
        this.receiverUsername = "@" + receiver.split("@").filter(e => e != '')[0]
        // this.actorHref = senderProfileLink;
        // this.recepientName = recepientName;
        // this.recepientHref = recepientProfileLink;
        this.body = body;
    }

    static fromJson(msgJson) {
        const { sender, receiver, subject, body } = JSON.parse(msgJson);

        return new ExternalMessage(sender, receiver, subject, body);
    }

    toString() {
        return JSON.stringify(
            {
                "from": this.from,
                "to": this.to,
                "subject": this.subject,
                "body": this.body
            }
        );
    }
}