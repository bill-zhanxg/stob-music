const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const functions = require("../functions");
const lyricsParse = require('../lyrics');

let interactions = [];
let emojis = { loop1: '🔁', loop2: '🔂', back: '⏮️', pause: '⏸', play: '▶️', next: '⏭️', shuffle: '🔀', bell: '🔔', noBell: '🔕', leave: '🚪', queue: '🎶', lyric: '📄', lowVolume: '🔈', mediumVolume: '🔉', highVolume: '🔊' };

module.exports = {
    data: new SlashCommandBuilder()
        .setName('song')
        .setDescription('Show GUI!'),
    async execute(interaction) {
        await interaction.deferReply();
        let { client, guild, channel } = interaction;
        let queue = client.distube.getQueue(guild);
        if (!queue) return interaction.editReply({ embeds: [new MessageEmbed().setTitle('❌ There is nothing playing!').setColor("RED")] });

        // Add Silent
        if (client.silent.indexOf(guild.id) == -1) client.silent.push(guild.id);

        // Delete the other message got sent in the same channel
        let c = interactions.filter(check => check.channel.id == channel.id);
        if (c.length > 0) for (let del of c) del.deleteReply().catch(() => { });
        interactions.push(interaction);

        let song = queue.songs[0];
        let loopType = queue.repeatMode
        let isPaused = queue.paused;
        let isSilent = client.silent.indexOf(guild.id) == -1 ? false : true;
        const status = `Volume: \`${queue.volume}%\` | Filters: \`${queue.filters.join(', ') || "Clear"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

        /* #region  Base Message */
        let embed = new MessageEmbed()
            .setColor("BLUE")
            .setTitle(`Now Playing: ${song.name}`)
            .setURL(song.url)
            .setThumbnail(song.thumbnail)
            .setDescription(functions.createBar(song.duration * 1000, queue.currentTime * 1000))
            .addField("Status: ", status)

        let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('loop')
                    .setEmoji(loopType == 1 ? emojis.loop2 : emojis.loop1)
                    .setStyle(loopType == 0 ? 'DANGER' : 'SUCCESS'),
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('presong')
                    .setEmoji(emojis.back)
                    .setStyle('SECONDARY'),
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('pause')
                    .setEmoji(isPaused == true ? emojis.play : emojis.pause)
                    .setStyle('SUCCESS'),
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('nextsong')
                    .setEmoji(emojis.next)
                    .setStyle('SECONDARY'),
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('shuffle')
                    .setEmoji(emojis.shuffle)
                    .setStyle('SECONDARY'),
            );
        let row2 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('volume')
                    .setStyle('SUCCESS')
                    .setEmoji(queue.volume <= 10 ? emojis.lowVolume : queue.volume <= 50 ? emojis.mediumVolume : emojis.highVolume)
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('lyric')
                    .setStyle('SECONDARY')
                    .setEmoji(emojis.lyric)
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('queue')
                    .setStyle('SECONDARY')
                    .setEmoji(emojis.queue)
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('leave')
                    .setStyle('SECONDARY')
                    .setEmoji(emojis.leave)
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('silent')
                    .setEmoji(isSilent == true ? emojis.noBell : emojis.bell)
                    .setStyle('SUCCESS'),
            )
        let jumpRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('jump')
                    .setPlaceholder('Jump to a song')
                    .addOptions([]),
            );
        let filterRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('filter')
                    .setPlaceholder('Select the filter you want to apply')
                    .addOptions([
                        {
                            label: 'Clear',
                            description: 'Remove all filters',
                            value: 'clear',
                        },
                        {
                            label: 'Weird',
                            description: 'The filter that trolls your friends',
                            value: 'funny',
                        },
                        {
                            label: 'Reverse',
                            description: 'The coolest filter BUT MAY TAKE MINUTES TO LOAD',
                            value: 'reverse',
                        },
                        {
                            label: '3d',
                            value: '3d',
                        },
                        {
                            label: 'Bass Boost',
                            value: 'bassboost',
                        },
                        {
                            label: 'Surround',
                            value: 'surround',
                        },
                        {
                            label: 'Nightcore',
                            value: 'nightcore',
                        },
                        {
                            label: 'Echo',
                            value: 'echo',
                        },
                        {
                            label: 'Karaoke',
                            value: 'karaoke',
                        },
                        {
                            label: 'Vaporwave',
                            value: 'vaporwave',
                        },
                        {
                            label: 'Flanger',
                            value: 'flanger',
                        },
                        {
                            label: 'Gate',
                            value: 'gate',
                        },
                        {
                            label: 'Haas',
                            value: 'haas',
                        },
                        {
                            label: 'Mcompand',
                            value: 'mcompand',
                        },
                        {
                            label: 'Phaser',
                            value: 'phaser',
                        },
                        {
                            label: 'Tremolo',
                            value: 'tremolo',
                        },
                        {
                            label: 'Earwax',
                            value: 'earwax',
                        },
                    ]),
            );

        let songs = queue.songs.slice(0, 11);
        songs.map((song, index) => {
            let name = song.name
            jumpRow.components[0].options.push({
                label: name,
                value: index.toString(),
                description: null,
                emoji: null,
                default: false
            });
        })
        /* #endregion */

        interaction.editReply({ embeds: [embed], components: [row, row2, jumpRow, filterRow] });

        let filter = async i => i.message.id == (await interaction.fetchReply()).id;
        const collector = channel.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
            let queue = client.distube.getQueue(guild);
            if (!queue) return i.reply({ embeds: [new MessageEmbed().setTitle('❌ There is nothing playing!').setColor("RED")], ephemeral: true });

            if (i.customId == 'queue' || i.customId == 'lyric') {
                await i.deferReply({ ephemeral: true });
            }
            else {
                await i.deferReply();
            }

            if (i.customId == 'loop') {
                let loopType = queue.repeatMode;
                if (loopType === 0) {
                    client.distube.setRepeatMode(guild, 2);
                }
                else if (loopType === 1) {
                    client.distube.setRepeatMode(guild, 0);
                }
                else {
                    client.distube.setRepeatMode(guild, 1);
                }
                i.deleteReply().catch(() => { });
            }
            if (i.customId == 'presong') {
                client.distube.previous(guild).catch(() => {
                    client.distube.seek(guild, 0);
                });
                i.deleteReply().catch(() => { });
            }
            if (i.customId == 'pause') {
                let isPaused = queue.paused;
                isPaused == true ? client.distube.resume(guild) : client.distube.pause(guild);
                i.deleteReply().catch(() => { });
            }
            if (i.customId == 'nextsong') {
                client.distube.skip(guild).catch(() => client.distube.stop(guild));
                i.deleteReply().catch(() => { });
            }
            if (i.customId == 'shuffle') {
                client.distube.shuffle(guild);
                i.deleteReply().catch(() => { });
            }
            if (i.customId == 'silent') {
                let isSilent = client.silent.indexOf(guild.id) == -1 ? false : true;
                isSilent ? client.silent.splice(client.silent.indexOf(guild.id), 1) : client.silent.push(guild.id);
                i.deleteReply().catch(() => { });
            }
            if (i.customId == 'leave') {
                client.distube.stop(guild);
                i.deleteReply().catch(() => { });
            }
            if (i.customId == 'queue') {
                let counter = 0;
                for (e = 0; e < queue.songs.length; e += 20) {
                    let k = queue.songs;
                    let songs = k.slice(e, e + 20);
                    let embed = new MessageEmbed().setColor("BLUE").setDescription(songs.map((song, index) => `**${index + 1 + counter * 20}.** [${song.name}](${song.url}) - ${song.formattedDuration}`).join("\n"));
                    if (counter === 0) embed.setTitle(`Queue for: ${guild.name}`);
                    if (counter === Math.floor(queue.songs.length / 20)) embed.addField("Status: ", `Volume: \`${queue.volume}%\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "Queue" : "Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\` | Filters: \`${queue.filters.join(', ') || "Clear"}\` | Duration: \`${queue.formattedDuration}\``);
                    i.followUp({ embeds: [embed], ephemeral: true });
                    counter++;
                }
            }
            if (i.customId == 'volume') {
                if (queue.volume < 10) {
                    client.distube.setVolume(guild, 10);
                }
                else if (queue.volume < 50) {
                    client.distube.setVolume(guild, 50);
                }
                else if (queue.volume < 100) {
                    client.distube.setVolume(guild, 100);
                }
                else {
                    client.distube.setVolume(guild, 10);
                }
                i.deleteReply().catch(() => { });
            }
            if (i.customId == 'lyric') {
                let song = queue.songs[0].name;
                let lyrics = await lyricsParse(song);

                if (lyrics) {
                    let texts = functions.formatText(lyrics);

                    let count = 0;
                    for (let text of texts) {
                        let embed = new MessageEmbed()
                            .setColor("BLUE")
                            .setDescription(`\`\`\`${text}\`\`\``)

                        if (count === 0) embed.setTitle(`🎶 Here is the lyric for ${song}`);
                        i.followUp({ embeds: [embed], ephemeral: true });
                        count++;
                    }
                }
                else {
                    i.editReply({
                        embeds: [new MessageEmbed()
                            .setColor("RED")
                            .setTitle('❌ No Lyrics Found!')
                            .setDescription(`Please try search something else`)
                        ]
                    });
                }
            }
            if (i.customId == 'jump') {
                let index = parseInt(i.values[0]);
                client.distube.jump(guild, index).catch(() => { })
                i.deleteReply().catch(() => { });
            }
            if (i.customId == 'filter') {
                client.distube.setFilter(guild, false);
                if (i.values != 'clear') client.distube.setFilter(guild, i.values[0]);
                i.deleteReply().catch(() => { });
            }
        });

        let noEdit = false;
        const Interval = setInterval(async () => {
            if (noEdit) return;
            let queue = client.distube.getQueue(guild);
            if (!queue) {
                interaction.deleteReply().catch(() => { });
                collector.stop();
                clearInterval(Interval);
                return;
            }
            let allTimeouts = client.timeouts;
            let myTimeout = allTimeouts.filter(o => o.channel == channel.id)[0];
            if (myTimeout) {
                noEdit = true;
                allTimeouts.splice(allTimeouts.indexOf(myTimeout), 1);
                interaction.editReply({ embeds: [new MessageEmbed().setColor('RED').setTitle('I got rate limited, please wait 1 minute or use this command in another channel!')] }).catch(() => { });
                setTimeout(() => {
                    let needRemove = allTimeouts.filter(o => o.channel == channel.id);
                    for (let ch of needRemove) {
                        client.timeouts.splice(client.timeouts.indexOf(ch), 1);
                    }
                    noEdit = false;
                }, 60000);
            }

            if (!noEdit) {
                let song = queue.songs[0];
                let loopType = queue.repeatMode
                let isPaused = queue.paused;
                let isSilent = client.silent.indexOf(guild.id) == -1 ? false : true;
                const status = `Volume: \`${queue.volume}%\` | Filters: \`${queue.filters.join(', ') || "Clear"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

                let embed = new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle(`Now Playing: ${song?.name}`)
                    .setURL(song?.url)
                    .setThumbnail(song?.thumbnail)
                    .setDescription(functions.createBar(song?.duration * 1000, queue?.currentTime * 1000))
                    .addField("Status: ", status)
                let jumpRow = new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                            .setCustomId('jump')
                            .setPlaceholder('Jump to a song')
                            .addOptions([]),
                    );

                row.components[0].setStyle(loopType == 0 ? 'DANGER' : 'SUCCESS').setEmoji(loopType == 1 ? emojis.loop2 : emojis.loop1)
                row.components[2].setEmoji(isPaused == true ? emojis.play : emojis.pause)
                row2.components[4].setEmoji(isSilent == true ? emojis.noBell : emojis.bell)
                row2.components[0].setEmoji(queue.volume <= 10 ? emojis.lowVolume : queue.volume <= 50 ? emojis.mediumVolume : emojis.highVolume)
                let songs = queue.songs.slice(0, 11);
                songs.map((song, index) => {
                    let name = song.name
                    jumpRow.components[0].options.push({
                        label: name,
                        value: index.toString(),
                        description: null,
                        emoji: null,
                        default: false
                    });
                })

                if ((await interaction.fetchReply().catch(() => { }))?.components[0].components[2].emoji.name == emojis.play && isPaused == true) return;

                interaction.editReply({ embeds: [embed], components: [row, row2, jumpRow, filterRow] }).catch(() => interaction.deleteReply().catch(() => { }).finally(() => { collector.stop(); clearInterval(Interval); }));
            }
        }, 2000);
    },
};