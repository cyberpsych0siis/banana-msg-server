import BaseError from '../model/Error.js';
import fetch from 'node-fetch';

export async function sendExternalMessage(auth, msg, next) {
    //send message to remote server
    msg.getWebfingerAddresses().forEach(async (destination) => {
/*         const proto = process.env.USE_SSL != "false" ? "https" : "http";
        const webfingerRequestURI = proto + '://' + destination + `/.well-known/webfinger?resource=acct:${destC}`; */
        console.log("[Webfinger] " + destination);

        const response = await fetch(destination)

        if (response.status == 404) {
            next(new BaseError("User not found", 404))
        } else {
            const jsonData = await response.json();
            // console.log(jsonData);
            let sliced = jsonData.links.filter((entry) => {
                return entry.rel == "self" && entry.type == "application/activity+json"
            });

            if (sliced.length == 1) {
                sliced = sliced[0];

                fetch(sliced.href, {
                    method: "POST",
                    body: JSON.stringify(msg),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${auth}`
                    },
                }).then((data) => {
                    // console.log(data);
                    next({});
                })
            } else {
                next(new BaseError("User not found", 404))
            }
        }
    });
}