import fs from 'fs';
import jose from 'node-jose';
import express from 'express';

const keyStore = jose.JWK.createKeyStore();
let key;

keyStore.generate("RSA", 2048, {
    alg: "RS256",
    use: "sig"
}).then(e => {
    console.log("[JWKS] JWK generation complete");
    key = e;
});

export default (app, db) => {
    app.get("/jwks.json", (req, res, next) => {
        res.send(key.toJSON());
    });
}

export function getKID() {
    return key;
}