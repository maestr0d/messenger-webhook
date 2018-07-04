const express = require('express');
const bodyParser = require('body-parser');

const app = express().use(bodyParser.json());

const config = require("./config.json");

const messageHandler = require('./messageHandler.js');
const handler = new messageHandler(app, config.PAGE_ACCESS_TOKEN);

handler.on('message', function(data) {
    console.log("received message");
    let response;
    let randomNumber = Math.floor((Math.random() * 10000) + 1);

    switch (data.message.text) {
        case "abracadabra":
            response = {"text": `${randomNumber}`};
            break; 
        default:
            response = {"text": 'type abracadabra if you want to see the magic number'};
    }
    handler.send(data.sender, response);
});

handler.on('postback', function(data) {
    console.log(data.sender, data.postback);
});

app.listen(8085, () => console.log('webhook is listening'));

handler.pullHook();
handler.castHook(config.VERIFY_TOKEN);