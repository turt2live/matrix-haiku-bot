const config = require("config");
const sdk = require("matrix-js-sdk");
const HaikuHandler = require("./src/HaikuHandler");
const matrixUtils = require("matrix-js-snippets");

const client = sdk.createClient({
    baseUrl: config['homeserverUrl'],
    accessToken: config['accessToken'],
    userId: config['userId']
});

matrixUtils.autoAcceptInvites(client);
HaikuHandler.start(client);

client.startClient({initialSyncLimit: 3});