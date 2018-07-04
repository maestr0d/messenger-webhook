const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express().use(bodyParser.json());

const config = require("./config.json");

const config = require('./messageHandler.js');
const handler = new messageHandler(app, config.PAGE_ACCESS_TOKEN);

messageHandler.on('message', function(data) {
    let response;
    let randomNumber = Math.floor((Math.random() * 10000) + 1);

    switch (data.message.text) {
        case "abracadabra":
            response = {"text": `${randomNumber}`};
            break; 
        default:
            response = {"text": 'type abracadabra if you want to see the magic number'};
    }
    messageHandler.send(data.sender, response);
});

app.listen(8085, () => console.log('webhook is listening'));

messageHandler.castHook(config.VERIFY_TOKEN);