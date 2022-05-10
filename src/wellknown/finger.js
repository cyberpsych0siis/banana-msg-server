import URL from 'url';
import { lookupIdentifier, createDataEntry } from './lookup.js';
// import sql from '../../WebFinger.js/src/sql.js';

/**
 * Returns the value set in $PORT. Returns 80 if nothing is specified
 * @returns {number} the port as number
 */
export const getPort = function() {
    return process.env.PORT ?? 80;
}

/**
 * Returns the value set in $HOST. If nothing is specified it defaults to 0.0.0.0
 * @returns {string} Host-IP as string
 */
export const getHost = function() {
    return process.env.JWT_AUDIENCE ?? "0.0.0.0";
}

/**
 * Returns the value set in $DOMAIN. Returns "localhost" if nothing is specified
 * @returns {string} Domain as string
 */
export const getDomain = function() {
    return new URL.parse(process.env.JWT_AUDIENCE).hostname ?? "localhost";
}

/**
 * This is the main http.RequestListener instance that gets called when someone accesses the instance
 * @param {http.IncomingMessage} req The Incoming Message
 * @param {http.ServerResponse} res The Response object
 * @returns 
 */
export const webfingerListener = async function (db, req, res) {
    const query = new URLSearchParams(URL.parse(req.url).query);

    //only process requests that have the resource query set
    if (query.has("resource")) {

        //lookup account identifier
        lookupIdentifier(db, URL.parse(query.get("resource"))).then(data => {
            
            //if lookup was successful and a user was found...
            if (data) {
                
                //Convert the data to JSON String
                // const finalData = JSON.stringify(data.map(data => {
                //     return createDataEntry(data);
                // }));
                const finalData = JSON.stringify(createDataEntry(data));
                //...return status 200 and the data in the body as json...
                res.setHeader("Content-Length", Buffer.byteLength(finalData));
                res.setHeader("Content-Type", "application/json");

                res.status(200).end(finalData);
                // next(finalData);
                return;
                
                //...else data is null and we couldn't find the user. Return HTTP Code 404 and end the connection
            } else {
                console.log("Request didn't yield any results " + query)
                // res.writeHead(404);
                res.status(400).end();
                return;
            }
        });

    //if not send "Bad Request" and end the connection
    } else {
        res.writeHead(400);
        res.end();
        return;
    }
}

export default (app, db) => {
    // sql.setSql(mysql);
    app.get("/webfinger", (req, res, next) => {
        webfingerListener(db, req, res);
    });
}