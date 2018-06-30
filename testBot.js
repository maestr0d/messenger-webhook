'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express().use(bodyParser.json());
const PAGE_ACCESS_TOKEN = "EAAGMg6r08QwBANYGSS9GLzzDNLWsbIv1cmiOwZBEKtVbQVkiKdJ2uKZA483AOY0rjpqOZCLFDN3RwAtatsAZA2tX37MnFZCZCBXJL5ywEZAwmZC3WXwwTMFY9FEX4Rh74RAgrlJzjp1ka2XKeZBjZBjiEJZBT46FGMJvXC8RIHJGdcgpOSyddNHhrO6";
app.listen(8085, () => console.log('webhook is listening'));

app.post('/webhook', (req, res) => {
    let body = req.body;
    
    if (body.object === 'page') {

        body.entry.forEach(function(entry) {
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });
    
        function handleMessage(sender_psid, received_message) {
            let response;
            let randomNumber = Math.floor((Math.random() * 10000) + 1);

            switch (received_message.text) {
                case "abracadabra":
                response = {"text": `${randomNumber}`};
                break; 
                default: 
                response ={"text": 'type abracadabra if you want to see the magic number'};
            }

            callSendAPI(sender_psid, response);
        }

        function callSendAPI(sender_psid, response) {
            let request_body = {
                "recipient": {
                    "id": sender_psid
                },
                "message": response
            }

            request({
                "uri": "https://graph.facebook.com/v2.6/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                if (!err) {
                    console.log('message sent!')
                } else {
                    console.error("unable to send message:" + err);
                }
            });
        }
    res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

app.get('/webhook', (req, res) => {
    let VERIFY_TOKEN = "minh1998"

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            res.sendStatus(403);
        }
    }    
});
