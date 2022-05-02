import { getDomain } from "./finger.js";
import dotenv from 'dotenv';
import SqlSingleton from './sql.js';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();


const useStrictDomainChecking = function() {
    return Boolean(process.env.STRICT_DOMAIN_CHECKING ?? "true") == true;
}

export const lookupIdentifier = async function (identifier) {
    const { protocol, href, auth, hostname } = identifier;
    if (protocol === "acct:" && (useStrictDomainChecking() || hostname === getDomain())) {
        //search for auth in database
        console.log("Searching for Username " + auth + " on " + process.env.JWT_AUDIENCE)
        const userdata = await searchForUserdata(auth);
        console.log(userdata);

        if (userdata) {
            //Object.assign(userdata, {subject: href});
            return userdata
        }
    }

    return null;
}

export function createDataEntry(subjectName) {
    let ownAddress = process.env.JWT_AUDIENCE ?? "http://localhost";
    
    return {
        id: uuidv4(),
        subject: ownAddress + "/profile/" + subjectName,
        aliases: [
            ownAddress
        ],
        links: [
            {
                //rel="publickey" type="text/plain" title="Public Key" href="http://rasterweb.net/raster/pgpkey.txt"
                "rel": "http://webfinger.net/rel/profile-page",
                "type": "text/html",
                "href": "http://localhost"
            },
            {
                "rel": "publickey",
                "type": "text/plain",
                "href": ownAddress + "/.well-known/keys?resource=acct" + subjectName + "@" + ownAddress
            }
        ]
    }
}

async function searchForUserdata(name) {

    //needed for keys
    //sql.query("SELECT `publicKey` FROM `userKeys` WHERE username = ?",

    return SqlSingleton.query("SELECT `username`, `publicKey` FROM `userKeys` WHERE username = ?", [name]);
}