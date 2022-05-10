export default class ActivityPubMessage {

    constructor(senderName, senderProfileLink, recepientName, recepientProfileLink, body) {
        this.actorName = senderName;
        this.actorHref = senderProfileLink;
        this.recepientName = recepientName;
        this.recepientHref = recepientProfileLink;
        this.body = body;
        // console.log(body);
    }

    toString() {
        return JSON.stringify({
            "@context": "https://www.w3.org/ns/activitystreams",
            // "id": "http://example.org/foo",
            "type": "Create",
            "actor": this.actorHref,
            "name": "My favourite stew recipe",
            "object": {
                // "id": "https://social.example/objects/1",
                "type": "Note",
                "content": this.body,
                // "attributedTo": this.recepientHref
            },
            "to": {
                "name": this.recepientName,
                "type": "Person",
                "id": this.recepientHref
            },
            "from": {
                "name": this.actorName,
                "type": "Person",
                "href": this.actorHref
            },
            "published": Date.UTC()
        });
    }
}