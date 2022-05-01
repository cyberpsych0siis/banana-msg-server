# WebFinger.js

Mount the instance to ```/.well-known/webfinger``` to use it on your server.

## What works?

You currently can only search for ```example@localhost``` since the "search results" are not dynamic yet.

## Usage
Run the script with ```yarn start``` or ```npm start``` to start the server.
Use ```curl http://localhost?resource=acct:example@localhost``` to see it in action.

## Environment Variables

|Name|Description|Default|
|-|-|-|
|$PORT|Port the server should run on|80|
|$HOST|IP the server should listen to|0.0.0.0|
|$DOMAIN|The domain the server is responsible for (typically the domain you run it on)|localhost|
|$STRICT_DOMAIN_CHECKING|Controls if the domain should be checked on each request|true|