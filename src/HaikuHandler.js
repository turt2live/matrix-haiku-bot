const LogService = require("./LogService");
const syllable = require('syllable');

class HaikuHandler {
    constructor() {
    }

    start(client) {
        this._client = client;

        client.on('event', event => {
            if (event.getStateKey() === this._client.credentials.userId) return;
            if (event.getSender() === this._client.credentials.userId) return;

            this._tryHaiku(event);
        });
    }

    _tryHaiku(event) {
        if (event.getType() !== "m.room.message") return;
        if (event.getContent().msgtype !== "m.text") return;

        // Haikus are 5-7-5 syllables

        var haikuLines = [];
        var syllableCount = 0;
        var currentLine = 0;

        var words = event.getContent().body.split(/\s+/g);
        for (var word of words) {
            var syllables = syllable(word.replace(/[^0-9a-zA-Z]]/g, ''));

            var requiredForLine = currentLine == 1 ? 7 : 5;
            if (syllableCount + syllables > requiredForLine) {
                // Not a haiku: words don't fit format
                LogService.verbose("HaikuHandler", "Not a haiku (wrong syllable count) in room " + event.getRoomId());
                return;
            }

            if (!haikuLines[currentLine]) haikuLines[currentLine] = "";
            haikuLines[currentLine] = haikuLines[currentLine] + " " + word;
            syllableCount += syllables;

            if (syllableCount === requiredForLine) {
                currentLine++;
                syllableCount = 0;
            }
        }

        if (syllableCount !== 0) {
            // Not a haiku: not enough syllables
            LogService.verbose("HaikuHandler", "Not a haiku (not enough syllables) in room " + event.getRoomId());
            return;
        }

        var realHaikuLines = [];
        for (var line of haikuLines) {
            if (line.trim().length > 0)
                realHaikuLines.push(line);
        }

        if (realHaikuLines.length !== 3) {
            // Not a haiku: not enough or too many lines
            LogService.verbose("HaikuHandler", "Not a haiku (not enough or too many lines) in room " + event.getRoomId());
            return;
        }

        var haiku = "";
        for (var line of realHaikuLines) {
            haiku += line.trim() + "\n";
        }
        haiku = haiku.trim();

        // We're a haiku
        LogService.info("HaikuHandler", "Found haiku in room " + event.getRoomId());
        this._client.sendNotice(event.getRoomId(), haiku);
    }
}

module.exports = new HaikuHandler();