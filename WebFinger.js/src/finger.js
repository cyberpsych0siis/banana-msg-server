import URL from 'url';
import { lookupIdentifier, createDataEntry } from './lookup.js';
import sql from './sql.js';

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
    return process.env.JWT_AUDIENCE ?? "localhost";
}

/**
 * This is the main http.RequestListener instance that gets called when someone accesses the instance
 * @param {http.IncomingMessage} req The Incoming Message
 * @param {http.ServerResponse} res The Response object
 * @returns 
 */
export const webfingerListener = function (req, res) {
    const query = new URLSearchParams(URL.parse(req.url).query);

    //only process requests that have the resource query set
    if (query.has("resource")) {

        //lookup account identifier
        lookupIdentifier(URL.parse(query.get("resource"))).then(data => {

            
            //if lookup was successful and a user was found...
            if (data) {
                
                //Convert the data to JSON String
                const finalData = JSON.stringify(data.map(data => {
                    return createDataEntry(data);
                }));
                
                //...return status 200 and the data in the body as json...
                res.writeHead(200, "Success", {
                    "Content-Length": Buffer.byteLength(finalData),
                    "Content-Type": "application/json"
                });
                res.end(finalData);
                return;
                
                //...else data is null and we couldn't find the user. Return HTTP Code 404 and end the connection
            } else {
                console.log("Request didn't yield any results " + query)
                res.writeHead(404);
                res.end();
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

export default (app, mysql) => {
    sql.setSql(mysql);
    app.get("/.well-known/webfinger", webfingerListener);
}