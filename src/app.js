'use strict';

const express = require('express');
//const bodyParser = require('body-parser');

const TwitterBot = require('./twitterbot');
const TwitterBotConfig = require('./twitterbotconfig');

const REST_PORT = (process.env.PORT || 5000);
const DEV_CONFIG = process.env.DEVELOPMENT_CONFIG == 'true';

const APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_TOKEN;
const APIAI_LANG = process.env.APIAI_LANG;

// console timestamps
require('console-stamp')(console, 'yyyy.mm.dd HH:MM:ss.l');

const botConfig = new TwitterBotConfig(APIAI_ACCESS_TOKEN, APIAI_LANG);
const bot = new TwitterBot(botConfig);

const app = express();


app.listen(REST_PORT, function () {
    console.log('Rest service ready on port ' + REST_PORT);
});