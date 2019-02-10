import {
    AutojoinRoomsMixin,
    AutojoinUpgradedRoomsMixin,
    LogService,
    MatrixClient,
    RichReply,
    SimpleFsStorageProvider,
    SimpleRetryJoinStrategy
} from "matrix-bot-sdk";
import config from "./config";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as syllable from "syllable";
import * as striptags from "striptags";

mkdirp.sync(config.dataPath);

const storageProvider = new SimpleFsStorageProvider(path.join(config.dataPath, "__matrix.db"));
const client = new MatrixClient(config.homeserverUrl, config.accessToken, storageProvider);

AutojoinRoomsMixin.setupOnClient(client);
AutojoinUpgradedRoomsMixin.setupOnClient(client);
client.setJoinStrategy(new SimpleRetryJoinStrategy());

client.on("room.message", async (roomId, event) => {
    if (event['sender'] === await client.getUserId()) return;
    if (!event['content']) return;
    if (event['content']['msgtype'] !== 'm.text') return;

    // Haikus are 5-7-5 syllables

    const haikuLines = [];
    let syllableCount = 0;
    let totalSyllableCount = 0;
    let currentLine = 0;

    const words = (event['content']['body'] || "").split(/\s+/g);
    for (const word of words) {
        const syllables = syllable(word.replace(/[^0-9a-zA-Z]/g, ''));
        totalSyllableCount += syllables;

        const requiredForLine = currentLine === 1 ? 7 : 5;
        if (syllableCount + syllables > requiredForLine) {
            // Not a haiku: words don't fit format
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

    if (totalSyllableCount !== 17) {
        // Not a haiku: not enough syllables
        return;
    }

    const realHaikuLines = [];
    for (const line of haikuLines) {
        if (line.trim().length > 0) realHaikuLines.push(line);
    }

    if (realHaikuLines.length !== 3) {
        // Not a haiku: not enough or too many lines
        return;
    }

    let haiku = "";
    for (const line of realHaikuLines) {
        haiku += line.trim() + "\n";
    }
    haiku = haiku.trim();

    // We're a haiku
    haiku = striptags(haiku);
    const haikuHtml = haiku.replace(/\n/g, '<br/>');
    const reply = RichReply.createFor(roomId, event, haiku, haikuHtml);
    reply['msgtype'] = 'm.notice';
    return client.sendMessage(roomId, reply);
});

client.start().then(async () => {
    const userId = await client.getUserId();
    LogService.info("index", "Haiku bot started as " + userId);
});
