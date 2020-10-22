# r/PlayingCardsMarketBot

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
    -[Prerequisites](#prereqs)
    -[Installing](#install)
- [Usage](#usage)


## About <a name = "about"></a>

This bot was crafted for r/PlayingCardsMarket. The bot takes votes from those who have dealt with an other user, either successfully, or unsuccessfully, and updates that user's flair accordingly. It takes the current values it finds within the user flair (Positive: ?? Negative: ?? Neutral: ??) and increments them according to a user directive when summoned.


## Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the bot up and running on your local machine.


## Prerequisites <a name="prereqs"></a>

Make sure you have the correct version of NodeJS for your system. You can find the download here(https://nodejs.org/en/download/)

You'll have to create a new account for your bot before you move any further.\
And you'll have to grant the account permissions on your subreddit.\
Once the account is created, log in, go to this url(reddit.com/prefs/apps), and fill out the form to create a new script app.


<img src='https://i.imgur.com/yq8akJ7.png'>

## Installing <a name="install"></a>

Now that you've set up your bot account, granted it permissions on your subreddit, and created a script app, it's time to download the source code and paste in your environment variables.

Download the .zip file containing the source code on this page. Unzip it and save it to your computer somewhere. Now open up the pw.envEXAMPLE file.\
Also have open reddit.com/prefs/apps as you'll need to copy/paste the items you'll find there.\
__USER_AGENT__ is just a name that the server will identify your bot by. It can be whatever you want.\
__CLIENT_ID__ and __CLIENT_SECRET__ are fround in prefs/apps.\
__REDDIT_USER__ is your bots username.\
__REDDIT_PASS__ is its password.\
__MASTER_SUB__ is the subreddit it will work on.\
__DEBUG_NETWORK__ can be set to false.\
__STARTUP_LIMIT__ will cause the bot to check this many items when starting up. This is to ensure that when stopping and restarting the bot, no requests are forgotten. Can be set up to 100.\
__MENTIONS_LIMIT__ is the amount of mentions the bot will check on every sweep after the initial one.\
__INTERVAL__ the time minutes the bot will sleep between requests.\
__COMMAND_PREFIX__ The symbol to prefix your commands with.\
__FLAIR_CSS_CLASS__ can be found in your mod panel on the edit/create user flair form. Make sure you are selecting the css class, and not the ID.\


USER_AGENT="YOUR BOTS NAME"
CLIENT_ID="FROM PREFS/APPS"
CLIENT_SECRET="FROM PREFS/APPS"
REDDIT_USER="YOUR BOT'S USERNAME"
REDDIT_PASS="YOUR BOT'S PASSWORD"
MASTER_SUB="YOUR SUBREDDIT'S NAME"
DEBUG_NETWORK='false'
STARTUP_LIMIT='25'
MENTIONS_LIMIT=25'
INTERVAL='1'
COMMAND_PREFIX="!"
FLAIR_CSS_CLASS="my-css-class"


now remove the EXAMPLE from the end of the filename.

> pw.envEXAMPLE = pw.env

Now go back to your terminal and cd into the folder. Run this command to install the dependencies required to run a reddit bot in JavaScript.

> npm install

Give it a minute to finish installing the dependencies. . . Then:


> node src/app.js


## Usage <a name = "usage"></a>


When a user calls the bot, it will receive a mention in its inbox and will respond accordingly.\
It checks the post it was summoned from, gets the user and updates their user flair by incrementing the current values.\
A user can summon the bot by calling its username, then passing in a directive.

Requests must be formatted as:
```
u/SnootyScraper !positive
u/SnootyScraper !negative
u/SnootyScraper !neutral
```
