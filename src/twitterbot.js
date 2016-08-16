'use strict';

const apiai = require('apiai');
const uuid = require('node-uuid');
const Twit = require('twit');

module.exports = class TwitterBot {

    get apiaiService() {
        return this._apiaiService;
    }

    set apiaiService(value) {
        this._apiaiService = value;
    }

    get botConfig() {
        return this._botConfig;
    }

    set botConfig(value) {
        this._botConfig = value;
    }

    get sessionIds() {
        return this._sessionIds;
    }

    set sessionIds(value) {
        this._sessionIds = value;
    }

    constructor(botConfig) {
        this._botConfig = botConfig;
        var apiaiOptions = {
            language: botConfig.apiaiLang,
            requestSource: "twitter"
        };

        this._apiaiService = apiai(botConfig.apiaiAccessToken, apiaiOptions);
        this._sessionIds = new Map();
    }

    start() {
        this._t = new Twit({
            consumer_key: this.botConfig.consumerKey,
            consumer_secret: this.botConfig.consumerSecret,
            access_token: this.botConfig.accessToken,
            access_token_secret: this.botConfig.accessTokenSecret
        });

        this._stream = this._t.stream('statuses/sample');

        this._stream.on('tweet', (tweet) => {
            this.processMessage(tweet);
        })
    }

    stop() {
        this._stream.stop()
    }

    processMessage(tweet) {
        if (this._botConfig.devConfig) {
            console.log("body", req.body);
        }

        if (tweet.text && tweet.user) {
            let chatId = tweet.user.id_str;
            let messageText = tweet.text;
            let userName = tweet.user.screen_name;

            console.log(chatId, messageText);

            if (messageText) {
                if (!this._sessionIds.has(chatId)) {
                    this._sessionIds.set(chatId, uuid.v1());
                }

                let apiaiRequest = this._apiaiService.textRequest(messageText,
                    {
                        sessionId: this._sessionIds.get(chatId)
                    });

                apiaiRequest.on('response', (response) => {
                    if (TwitterBot.isDefined(response.result)) {
                        let responseText = "@" + userName + " " + response.result.fulfillment.speech;

                        if (TwitterBot.isDefined(responseText)) {
                            console.log('Response as text message');
                        } else {
                            console.log('Received empty speech');
                        }
                    } else {
                        console.log('Received empty result')
                    }
                });

                apiaiRequest.on('error', (error) => console.error(error));
                apiaiRequest.end();
            }
            else {
                console.log('Empty message');

            }
        } else {
            console.log('Empty message');

        }
    }

    static isDefined(obj) {
        if (typeof obj == 'undefined') {
            return false;
        }

        if (!obj) {
            return false;
        }

        return obj != null;
    }
}