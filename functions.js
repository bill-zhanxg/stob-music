const { } = require('discord.js');
const config = require('./config.json');

module.exports = {
    getAusDateNow: getAusDateNow,
    createBar: createBar,
    format: format,
    formatText: formatText,
};

function getAusDateNow() {
    let options = {
        timeZone: 'Australia/Melbourne',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    }
    let formatter = new Intl.DateTimeFormat([], options);

    return formatter.format(new Date());
}

function createBar(maxtime, currenttime, size = 25, line = "▬", slider = "🔶") {
    try {
        let bar = currenttime > maxtime ? [line.repeat(size / 2 * 2), (currenttime / maxtime) * 100] : [line.repeat(Math.round(size / 2 * (currenttime / maxtime))).replace(/.$/, slider) + line.repeat(size - Math.round(size * (currenttime / maxtime)) + 1), currenttime / maxtime];
        if (!String(bar).includes("🔶")) return `**[🔶${line.repeat(size - 1)}]**\n**00:00:00 / 00:00:00**`;
        return `**[${bar[0]}]**\n**${new Date(currenttime).toISOString().substr(11, 8) + " / " + (maxtime == 0 ? " ◉ LIVE" : new Date(maxtime).toISOString().substr(11, 8))}**`;
    } catch (e) {
        console.log(String(e.stack).bgRed)
    }
}

function format(millis) {
    try {
        var h = Math.floor(millis / 3600000),
            m = Math.floor(millis / 60000),
            s = ((millis % 60000) / 1000).toFixed(0);
        if (h < 1) return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s + " | " + (Math.floor(millis / 1000)) + " Seconds";
        else return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s + " | " + (Math.floor(millis / 1000)) + " Seconds";
    } catch (e) {
        console.log(String(e.stack).bgRed)
    }
}

function formatText(text, maxMessageLength = 4000, separator = "\n") {
    text = text.replace(/\t/g, "    ");
    let longWords = text.match(new RegExp(`[^${separator.replace("\n", "\\n")}]{${maxMessageLength * (19 / 20)},}`, "gm"));
    if (longWords) for (let longWord of longWords) {
        let count1 = 0;
        let shortWords = [];
        longWord.split("").forEach(c => {
            if (shortWords[count1] && (shortWords[count1].length >= maxMessageLength * (19 / 20) || (c == "\n" && shortWords[count1].length >= maxMessageLength * (19 / 20) - 100))) count1++;
            shortWords[count1] = shortWords[count1] ? shortWords[count1] + c : c;
        });
        text = text.replace(longWord, shortWords.join(separator));
    }
    let messages = [];
    let count2 = 0;
    text.split(separator).forEach((word) => {
        if (messages[count2] && (messages[count2] + "" + word).length > maxMessageLength * (39 / 40)) count2++;
        messages[count2] = messages[count2] ? messages[count2] + separator + word : word;
    });

    let insertCodeBlock = null, insertCodeLine = null;
    for (let j = 0; j < messages.length; j++) {
        if (insertCodeBlock) {
            messages[j] = insertCodeBlock + messages[j];
            insertCodeBlock = null;
        }
        else if (insertCodeLine) {
            messages[j] = insertCodeLine + messages[j];
            insertCodeLine = null;
        }

        let codeBlocks = messages[j].match(/`{3,}[\S]*\n|`{3,}/gm);
        let codeLines = messages[j].match(/[^`]{0,1}`{1,2}[^`]|[^`]`{1,2}[^`]{0,1}/gm);

        if (codeBlocks && codeBlocks.length % 2 == 1) {
            messages[j] = messages[j] + "```";
            insertCodeBlock = codeBlocks[codeBlocks.length - 1] + "\n";
        }
        else if (codeLines && codeLines.length % 2 == 1) {
            insertCodeLine = codeLines[codeLines.length - 1].replace(/[^`]/g, "");
            messages[j] = messages[j] + insertCodeLine;
        }
    }
    return messages;
}