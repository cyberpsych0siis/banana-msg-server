import { getDomain } from "./finger.js";
import dotenv from 'dotenv';
// import SqlSingleton from './sql.js';
import { v4 as uuidv4 } from 'uuid';
import { queryGetOnce } from '../connector/database.js';
dotenv.config();


const useStrictDomainChecking = function () {
    return Boolean(process.env.STRICT_DOMAIN_CHECKING ?? "true");
}

export const lookupIdentifier = async function (db, identifier) {
    // console.log(identifier);
    const { protocol, href, auth, host } = identifier;
    console.log(useStrictDomainChecking(), getDomain(), host);
    if (protocol === "acct:" && (useStrictDomainChecking() && host === getDomain())) {
        //search for auth in database
        console.log("[Lookup] Searching for Username " + auth + " for domain " + process.env.JWT_AUDIENCE)
        const userdata = await searchForUserdata(db, auth);

        if (userdata) {
            console.log("Found userdata: " + userdata.username)
            return userdata
        }
    }

    return null;
}

export function createDataEntry(dbSubject) {
    let ownAddress = process.env.JWT_AUDIENCE ?? "invalid issuer";

    return {
        subject: ownAddress + "/profile/" + dbSubject.username,
        aliases: [
            ownAddress,
            dbSubject.username
        ],
        links: [
            {
                //rel="publickey" type="text/plain" title="Public Key" href="http://rasterweb.net/raster/pgpkey.txt"
                "rel": "http://webfinger.net/rel/profile-page",
                "type": "text/html",
                "href": ownAddress
            },
            /*             {
                            "rel": "http://microformats.org/wiki/rel-reply-to",
                            "type": "application/json",
                            "href": ownAddress + "/messages/" + dbSubject.username
                        }, */
            {
                "rel": "publickey",
                "type": "text/plain",
                "href": ownAddress + "/.well-known/keys?resource=" + dbSubject.username
            },
            {
                "rel": "self",
                "type": "application/activity+json",
                "href": ownAddress + "/messages/"
            }/* ,
            {
                "rel": "http://ostatus.org/schema/1.0/subscribe",
                "template": "https://mastodon.social/authorize_interaction?uri={uri}"
            } */
        ]
    }
}

async function searchForUserdata(db, name) {

    //needed for keys
    //sql.query("SELECT `publicKey` FROM `userKeys` WHERE username = ?",

    let data = await queryGetOnce(db, "webfinger", {
        ":username": name
    })

    return data;
}