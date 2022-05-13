// const crypto = require("crypto");
import crypto from 'crypto';
// const fs = require("fs");
import fs from 'fs';

export function generate(passphrase, path) {
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

    fs.writeFileSync(path + "/privkey.pem", keys.privateKey)
    fs.writeFileSync(path + "/pubkey.pem", keys.publicKey)

    return keys;
}

/* module.exports.save = function() {
    console.log(__dirname);

} */