const { Intents, Client, Collection, WebhookClient, MessageEmbed, Permissions } = require('discord.js');
const fs = require('fs');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const config = require('./config.json');
const functions = require('./functions');
const process = require('process');
require("./deploy-commands")();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});

client.commands = new Collection();
client.silent = [];
client.timeouts = [];
client.distube = new DisTube(client, {
    plugins: [new SpotifyPlugin(), new SoundCloudPlugin(), new YtDlpPlugin()],
    emitNewSongOnly: false,
    leaveOnEmpty: true,
    leaveOnFinish: true,
    leaveOnStop: true,
    savePreviousSongs: true,
    searchSongs: 0,
    youtubeDL: false,
    updateYouTubeDL: true,
    customFilters: {
        "funny": "bass=g=10,apulsator=bpm=300:timing=bpm:hz=1,asubboost",
    },
    searchCooldown: 60,
    emptyCooldown: 600,
    nsfw: false,
    emitAddListWhenCreatingQueue: true,
    emitAddSongWhenCreatingQueue: false,
})

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

process.on('uncaughtException', (err, origin) => {
    const webhookClient = new WebhookClient({ url: config.webHooks.error });
    webhookClient.send({ embeds: [new MessageEmbed().setColor('RED').setTitle("Stob YouTube Crashed! Here is the error:").setDescription(`Caught exception: \`\`\`${err.stack}\`\`\`\nException origin: ${origin}`).setFooter({ text: `Crashed at ${functions.getAusDateNow()}` })] });
});

client.on("ready", async () => {
    setActivity();

    sendLog(
        `Logged in as ${client.user.tag}!`,
        new MessageEmbed()
            .setColor('YELLOW')
            .setTitle(`Stob YouTube client active as ${client.user.tag}!`)
            .setFooter({ text: `At ${functions.getAusDateNow()}` })
    )
    
    console.log('Server started!');
})

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;
        if (!interaction.channel.permissionsFor(interaction.guild.me).has(new Permissions([Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS]))) return interaction.reply({embeds: [new MessageEmbed().setColor('RED').setTitle("I need VIEW_CHANNEL, SEND_MESSAGES and EMBED_LINKS permission in this channel to work normally!")]});
        logCommands(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }), interaction.commandName, interaction.guild.name, interaction.channel.id);
        await command.execute(interaction);
    }
})

client.on("rateLimit", rateLimitData => {
    let timeout = rateLimitData.timeout;
    let arr = rateLimitData.path.split("/");
    let channelId = arr[2];
    let msgId = arr[4];
    client.timeouts.push({ channel: channelId, time: timeout, message: msgId });
})
setInterval(() => client.timeouts = [], 36000000);

client.on("guildCreate", guild => {
    sendLog(
        `I have join a new guild: ${guild.name}`,
        new MessageEmbed()
            .setColor('AQUA')
            .setTitle(`Stob YouTube have join a new guild: ${guild.name}`)
            .setFooter({ text: `At ${functions.getAusDateNow()}` })
    )
    setActivity();
})

client.on("guildDelete", async guild => {
    sendLog(
        `I have being kicked from a guild: ${guild.name}`,
        new MessageEmbed()
            .setColor('RED')
            .setTitle(`Stob YouTube have being kicked from a guild: ${guild.name}`)
            .setFooter({ text: `At ${functions.getAusDateNow()}` })
    )
    setActivity();
})

function setActivity() {
    client.user.setActivity(`Music in ${client.guilds.cache.size} Servers`, {
        type: "LISTENING",
    }); // STREAMING, WATCHING, CUSTOM_STATUS, PLAYING, COMPETING, LISTENING
}

function logCommands(user, userIconURL, commandName, guild, channel) {
    sendLog(
        `User: ${user}, used command: /${commandName}, in guild: ${guild}, in channel(id): ${channel}. At ${functions.getAusDateNow()}`,
        new MessageEmbed()
            .setAuthor({ name: `Command Used by: ${user}`, iconURL: userIconURL })
            .setTitle(`Slash Command used: (/)${commandName}`)
            .setColor('GREEN')
            .setDescription(`Command Name: **${commandName}**\nGuild: **${guild}**\nChannel id: **${channel}**`)
            .setFooter({ text: `Command Used at: ${functions.getAusDateNow()}` })
    )
}

function sendLog(consoleLog, webhookEmbed) {
    if (consoleLog) console.log(consoleLog);
    if (webhookEmbed) {
        const webhookClient = new WebhookClient({ url: config.webHooks.event });
        webhookClient.send({ embeds: [webhookEmbed] });
    }
}

const status = (queue) => `Volume: \`${queue.volume}%\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "Queue" : "Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;
client.distube
    .on("addSong", (queue, song) => {
        queue.textChannel.send({
            embeds: [new MessageEmbed()
                .setTitle("Added :thumbsup: " + song.name)
                .setURL(song.url)
                .setColor("BLUE")
                .addField(`${queue.songs.length} Songs in the Queue`, `Queue Duration: \`${queue.formattedDuration}\``)
                .addField("Song Duration", `\`${song.formattedDuration}\``)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Requested by: ${song.user.tag}`, iconURL: song.user.displayAvatarURL({ dynamic: true }) })]
        });
    })
    .on("addList", (queue, playlist) => {
        queue.textChannel.send({
            embeds: [new MessageEmbed()
                .setTitle("Added Playlist :thumbsup: " + playlist.name + ` - \`[${playlist.songs.length} songs]\``)
                .setURL(playlist.url)
                .setColor("BLUE")
                .addField("Playlist Duration", `\`${playlist.formattedDuration}\``)
                .addField(`${queue.songs.length} Songs in the Queue`, `Duration: \`${queue.formattedDuration}\``)
                .setThumbnail(playlist.thumbnail.url)
                .setFooter({ text: `Requested by: ${playlist.songs[0].user.tag}`, iconURL: playlist.songs[0].user.displayAvatarURL({ dynamic: true }) })]
        });
    })
    .on("playSong", (queue, song) => {
        if (client.silent.indexOf(queue.textChannel.guild.id) == -1) {
            queue.textChannel.send({
                embeds: [new MessageEmbed()
                    .setTitle("Playing :notes: " + song.name)
                    .setURL(song.url)
                    .setColor("BLUE")
                    .addField("Song Duration", `\`${song.formattedDuration}\``)
                    .addField("Queue Status", status(queue))
                    .setThumbnail(song.thumbnail)
                    .setFooter({ text: `Requested by: ${song.user.tag}`, iconURL: song.user.displayAvatarURL({ dynamic: true }) })]
            });
        }
    })
    .on("noRelated", queue => {
        queue.textChannel.send({
            embeds: [new MessageEmbed()
                .setColor("BLUE")
                .setTitle(`Sorry but I can not find any related video to play!`)]
        });
    })
    .on("searchNoResult", (message, query) => {
        message.channel.send({
            embeds: [new MessageEmbed()
                .setColor("RED")
                .setDescription(`❌ No result found for **${query.toString().slice(0, 1000)}...**!`)]
        });
    })
    .on("empty", queue => {
        queue.textChannel.send("I left because there is no one in the voice channel")
    })
    .on("finish", queue => {
        queue.textChannel.send("I left because there are no more song in queue")
    })
    .on("initQueue", queue => {
        queue.autoplay = false;
        queue.volume = 30;
        queue.filter = "clear";
        if (client.silent.indexOf(queue.textChannel.guild.id) != -1) client.silent.splice(client.silent.indexOf(queue.textChannel.guild.id), 1);
    })
    .on("error", (channel, error) => {
        channel.send({
            embeds: [new MessageEmbed()
                .setColor("RED")
                .setTitle(`❌ ERROR | An error occurred`)
                .setDescription(`\`\`\`${error.message}\`\`\``)]
        });
    });

client.login(config.private.token);