import fs from 'fs';
import jose from 'node-jose';
import crypto from 'crypto';
import path from 'path';

export const PASSPHRASE = process.env.JWT_SECRET ?? "top secret";

function generate(passphrase) {
    let keys = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: "spki",
            format: "pem",
        },
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
            cipher: "aes-256-cbc",
            passphrase: passphrase,
        },
    });

    return keys;
}

const keyStore = jose.JWK.createKeyStore();
let key;

let privateKey, publicKey;
// console.log(path.resolve(process.cwd(), process.env.SSL_PRIVKEY_PATH));
// console.log(process.env.JWT_PRIVKEY_PATH);
// console.log(path.resolve(process.cwd(), process.env.JWT_PRIVKEY_PATH));
try {
    privateKey = fs.readFileSync(path.resolve("./certs/privkey.pem"));
    publicKey = fs.readFileSync(path.resolve("./certs/pubkey.pem"));
    console.log("Found JWT keys on disk");
    // publicKey = fs.readFileSync("/certs/pubkey.pem");
} catch (e) {
    console.log("Generating new JWT Keys");
    const keys = generate(PASSPHRASE);
    
    console.log("Certificates have been generated with password '" + PASSPHRASE + "'");

    try {

        privateKey = keys.privateKey;
        publicKey = keys.publicKey;
        if (!fs.existsSync("./certs")) {
            fs.mkdirSync("./certs");
        }

        fs.writeFileSync(path.resolve("./certs/privkey.pem"), keys.privateKey)
        fs.writeFileSync(path.resolve("./certs/pubkey.pem"), keys.publicKey)
        console.log("Saved new certificates to ./certs");
        // console.log("Mount them inside the docker container to /certs/{privkey,pubkey}.pem and set JWT_SECRET env for persistence");
    } catch (e) {
        // console.error(e);
        console.error("Can't write keys", e.message);
    }   
}

export function getPrivateKey() {
    return privateKey;
}

export default (app) => {

    jose.JWK.asKey(Buffer.from(publicKey), "pem").
        then(function (result) {
            keyStore.add(result);
        });

    app.get("/jwks.json", (req, res, next) => {
        res.send(keyStore.toJSON());
    });
}