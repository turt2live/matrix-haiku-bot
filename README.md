# matrix-haiku-bot

[![TravisCI badge](https://travis-ci.org/turt2live/matrix-haiku-bot.svg?branch=master)](https://travis-ci.org/turt2live/matrix-haiku-bot)

Sends a haiku to the room if your message can be one. Talk about it in [#haiku:t2bot.io](https://matrix.to/#/#haiku:t2bot.io).

# Usage

1. Invite `@haiku:t2bot.io` to a room
2. Send a haiku-compatible message

# Building your own

1. Clone this repository
2. `npm install`
3. Copy `config/default.yaml` to `config/production.yaml`
4. Edit the values of `config/production.yaml` to match your needs
5. `npm run build`
5. Run the bot with `NODE_ENV=production node lib/index.js`
