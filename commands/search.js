const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const ytdl = require("ytdl-core");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for a video!')
        .addStringOption(option =>
            option.setName('video')
                .setDescription('The song to search for!')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        let { client, member, channel } = interaction;

        client.distube.search(interaction.options.getString('song'), { limit: 1 }).then(async (song) => {
            let name = song[0].name;
            let thumbnail = song[0].thumbnail;
            let formattedDuration = song[0].formattedDuration;
            let views = song[0].views.toString();
            let URL = song[0].url;

            let row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('dlVideoWaudio')
                        .setLabel('Download Video with Audio')
                        .setStyle('SUCCESS'),
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('dlAudio')
                        .setLabel('Download only Audio')
                        .setStyle('SUCCESS'),
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('dlVideo')
                        .setLabel('Download only Video')
                        .setStyle('SUCCESS'),
                )

            let embed = new MessageEmbed()
                .setColor("BLUE")
                .setTitle(`Video found: ${name}`)
                .setURL(URL)
                .addFields(
                    { name: "Video Duration", value: `\`${formattedDuration}\``, inline: true },
                    { name: "Video views", value: `\`${views}\``, inline: true },
                )
                .setThumbnail(thumbnail)
                .setFooter({ text: `Requested by: ${member.tag}`, iconURL: member.displayAvatarURL({ dynamic: true }) })

            await interaction.editReply({ embeds: [embed], components: [row] });

            let filter = async i => i.message.id == (await interaction.fetchReply()).id;
            const collector = channel.createMessageComponentCollector({ time: 120000, filter, max: 1 });

            collector.on('collect', async i => {
                if (i.customId === 'dlVideoWaudio') {
                    let mes = new MessageEmbed()
                        .setColor("GREEN")
                        .setTitle("Please choose which to download/view");
                    let dl1 = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('h')
                                .setLabel('Choose the highest setting')
                                .setStyle('SUCCESS'),
                        )
                        .addComponents(
                            new MessageButton()
                                .setCustomId('l')
                                .setLabel('Choose the lowest setting')
                                .setStyle('SUCCESS'),
                        )
                    let dl2 = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('ha')
                                .setLabel('Try minimize video bitrate for good audio')
                                .setStyle('SUCCESS'),
                        )
                        .addComponents(
                            new MessageButton()
                                .setCustomId('la')
                                .setLabel('Choose the lowest setting for audio')
                                .setStyle('SUCCESS'),
                        )
                    let dl3 = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('hv')
                                .setLabel('Try minimize audio respectively for good video')
                                .setStyle('SUCCESS'),
                        )
                        .addComponents(
                            new MessageButton()
                                .setCustomId('lv')
                                .setLabel('Choose the lowest setting for video')
                                .setStyle('SUCCESS'),
                        )
                    let msgid = i.reply({ ephemeral: true, embeds: [mes], components: [dl1, dl2, dl3] });

                    let ft = i => i.message.id == msgid.id;
                    const dlCT = channel.createMessageComponentCollector({ time: 180000, ft, max: 1 });

                    dlCT.on('collect', async col => {
                        await col.deferReply({ ephemeral: true });

                        if (col.customId === 'h') {
                            var { vURL, quality, bitrate, audioBitrate, format } = await dlVideoWaudio("highest")
                        }
                        else if (col.customId === 'l') {
                            var { vURL, quality, bitrate, audioBitrate, format } = await dlVideoWaudio("lowest")
                        }
                        else if (col.customId === 'ha') {
                            var { vURL, quality, bitrate, audioBitrate, format } = await dlVideoWaudio("highestaudio")
                        }
                        else if (col.customId === 'la') {
                            var { vURL, quality, bitrate, audioBitrate, format } = await dlVideoWaudio("lowestaudio")
                        }
                        else if (col.customId === 'hv') {
                            var { vURL, quality, bitrate, audioBitrate, format } = await dlVideoWaudio("highestvideo")
                        }
                        else if (col.customId === 'lv') {
                            var { vURL, quality, bitrate, audioBitrate, format } = await dlVideoWaudio("lowestvideo")
                        }
                        if (vURL == null) {
                            let erroEmbed = new MessageEmbed()
                                .setColor("RED")
                                .setTitle("I'm sorry but I didn't find any format with your requirement, try another option")
                            col.editReply({ embeds: [erroEmbed] });
                            return;
                        }
                        let btEmbed = new MessageEmbed()
                            .setColor("GREEN")
                            .setTitle('Here is the download link!\nTo download the video just **go into the link**, **click the three dot then download**')
                            .setDescription(vURL)
                            .addFields(
                                { name: "Video quality", value: quality, inline: true },
                                { name: "Video bitrate", value: bitrate, inline: true },
                                { name: "Audio Bitrate", value: audioBitrate, inline: true },
                                { name: "Video format", value: format, inline: true },
                            )
                        col.editReply({ embeds: [btEmbed] }).catch(() => { });
                    })
                }
                else if (i.customId === 'dlAudio') {
                    let mes = new MessageEmbed()
                        .setColor("GREEN")
                        .setTitle("Please choose which to download/view");
                    let dl1 = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('h')
                                .setLabel('Choose the best setting for audio')
                                .setStyle('SUCCESS'),
                        )
                        .addComponents(
                            new MessageButton()
                                .setCustomId('l')
                                .setLabel('Choose the worst setting for audio')
                                .setStyle('SUCCESS'),
                        )
                    let msgid = i.reply({ ephemeral: true, embeds: [mes], components: [dl1] });

                    let ft = i => i.message.id == msgid.id;
                    const dlCT = channel.createMessageComponentCollector({ time: 180000, ft, max: 1 });

                    dlCT.on('collect', async col => {
                        await col.deferReply({ ephemeral: true });

                        if (col.customId === 'h') {
                            var { vURL, audioBitrate, format } = await dlAudio("highest")
                        }
                        else if (col.customId === 'l') {
                            var { vURL, audioBitrate, format } = await dlAudio("lowest")
                        }
                        if (vURL == null) {
                            let erroEmbed = new MessageEmbed()
                                .setColor("RED")
                                .setTitle("I'm sorry but I didn't find any format with your requirement, try another option")
                            col.editReply({ embeds: [erroEmbed] });
                            return;
                        }
                        let btEmbed = new MessageEmbed()
                            .setColor("GREEN")
                            .setTitle('Here is the download link!\nTo download the audio just **go into the link**, **click the three dot then download**')
                            .setDescription(vURL)
                            .addFields(
                                { name: "Audio Bitrate", value: audioBitrate, inline: true },
                                { name: "Audio format", value: format, inline: true },
                            )
                        col.editReply({ embeds: [btEmbed] });
                    })
                }
                else if (i.customId === 'dlVideo') {
                    let mes = new MessageEmbed()
                        .setColor("GREEN")
                        .setTitle("Please choose which to download/view");
                    let dl1 = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('h')
                                .setLabel('Choose the best setting for video')
                                .setStyle('SUCCESS'),
                        )
                        .addComponents(
                            new MessageButton()
                                .setCustomId('l')
                                .setLabel('Choose the worst setting for video')
                                .setStyle('SUCCESS'),
                        )
                    let msgid = i.reply({ ephemeral: true, embeds: [mes], components: [dl1] });

                    let ft = i => i.message.id == msgid.id;
                    const dlCT = channel.createMessageComponentCollector({ time: 180000, ft, max: 1 });

                    dlCT.on('collect', async col => {
                        await col.deferReply({ ephemeral: true });

                        if (col.customId === 'h') {
                            var { vURL, quality, bitrate, format } = await dlVideo("highest")
                        }
                        else if (col.customId === 'l') {
                            var { vURL, quality, bitrate, format } = await dlVideo("lowest")
                        }
                        if (vURL == null) {
                            let erroEmbed = new MessageEmbed()
                                .setColor("RED")
                                .setTitle("I'm sorry but I didn't find any format with your requirement, try another option")
                            col.editReply({ embeds: [erroEmbed] });
                            return;
                        }
                        let btEmbed = new MessageEmbed()
                            .setColor("GREEN")
                            .setTitle('Here is the download link!\nTo download the video just **go into the link**, **click the three dot then download**')
                            .setDescription(vURL)
                            .addFields(
                                { name: "Video quality", value: quality, inline: true },
                                { name: "Video bitrate", value: bitrate, inline: true },
                                { name: "Video format", value: format, inline: true },
                            )
                        col.editReply({ embeds: [btEmbed] });
                    })
                }
            });

            collector.on('end', collected => {
                row.components[0].setDisabled(true);
                row.components[1].setDisabled(true);
                row.components[2].setDisabled(true);
                interaction.editReply({ components: [row] }).catch(() => { });
            });

            async function dlVideoWaudio(type) {
                try {
                    let info = await ytdl.getInfo(URL);
                    let format = ytdl.chooseFormat(info.formats, { filter: "videoandaudio", quality: type })
                    return { vURL: format.url, quality: format.qualityLabel, bitrate: `${format.bitrate}`, audioBitrate: `${format.audioBitrate}`, format: format.container };
                }
                catch {
                    return { vURL: null, quality: null, bitrate: null, audioBitrate: null, format: null };
                }
            }
            async function dlAudio(type) {
                try {
                    let info = await ytdl.getInfo(URL);
                    let format = ytdl.chooseFormat(info.formats, { filter: "audioonly", quality: type })
                    return { vURL: format.url, audioBitrate: `${format.audioBitrate}`, format: format.container };
                }
                catch {
                    return { vURL: null, audioBitrate: null, format: null };
                }
            }
            async function dlVideo(type) {
                try {
                    let info = await ytdl.getInfo(URL);
                    let format = ytdl.chooseFormat(info.formats, { filter: "videoonly", quality: type })
                    return { vURL: format.url, quality: format.qualityLabel, bitrate: `${format.bitrate}`, audioBitrate: `${format.audioBitrate}`, format: format.container };
                }
                catch {
                    return { vURL: null, quality: null, bitrate: null, format: null };
                }
            }
        }).catch(() =>
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setColor("RED")
                    .setTitle('❌ No result found!')
                    .setDescription(`Try search something else or using URL`)
                ]
            })
        );
    }
}