# Missionday Telegram Bot

[![Build Status](https://travis-ci.org/EdJoPaTo/missionday-telegrambot.svg?branch=master)](https://travis-ci.org/EdJoPaTo/missionday-telegrambot)
[![Dependency Status](https://david-dm.org/EdJoPaTo/missionday-telegrambot/status.svg)](https://david-dm.org/EdJoPaTo/missionday-telegrambot)
[![Dependency Status](https://david-dm.org/EdJoPaTo/missionday-telegrambot/dev-status.svg)](https://david-dm.org/EdJoPaTo/missionday-telegrambot?type=dev)

## How to host your own

### Requirements

You will need NodeJS >=7.6 and NPM installed.

Hint: I only tested this on a Linux machine, so this might not run on a Windows computer.


### Install it

First, clone this git repository to your local computer or your server, where you want to run it:
```bash
git clone https://github.com/EdJoPaTo/missionday-telegrambot.git
```

Go into the new folder `missionday-telegrambot` and install the dependencies:
```bash
npm install --production
```

Then ask the [Botfather](https://t.me/BotFather) to create a new bot.
He will guide you through the steps needed to create the bot on Telegram.
He will give you a bot token.
Save the token as `token.txt` in the main folder.

Set description, botpic and so on with the Botfather.
You may want to use the current ones in the `botfather-settings` folder.

When everything is done, start the bot:
```bash
npm start
```

The checkout pictures will end in the `checkouts` folder with the given username as filename.

When something is unclear or you need help, file an [issue on GitHub](https://github.com/EdJoPaTo/missionday-telegrambot/issues) or send [me a Telegram message](https://t.me/EdJoPaTo).
