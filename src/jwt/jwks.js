import fs from 'fs';
import jose from 'node-jose';
import crypto from 'crypto';

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
try {
    privateKey = fs.readFileSync("/certs/privkey.pem");
    publicKey = fs.readFileSync("/certs/pubkey.pem");
} catch (e) {
    const keys = generate(PASSPHRASE);

    console.log("Certificates have been generated with password '" + PASSPHRASE + "'");
    console.log("Mount them inside the docker container to /certs/{privkey,pubkey}.pem and set JWT_SECRET env for persistence");
    privateKey = keys.privateKey;
    publicKey = keys.publicKey;
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

export function getKID() {
    return key;
}