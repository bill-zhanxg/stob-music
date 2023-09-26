const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { entersState, joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');
const axios = require("axios").default;
const prism = require('prism-media');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(require('ffmpeg-static'));
const config = require('../config.json');

let userIds = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getsong')
        .setDescription('Get the song by listening(song recognizer powered by shazam)!'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        let { channel, member } = interaction;

        let embed = new MessageEmbed()
            .setColor('BLUE')
            .setImage('https://cdn.discordapp.com/attachments/920156268029673582/928922333597552640/unknown.png')
            .setTitle('Song Recogniser')
            .setDescription("Guide:\n**1.** Before you start recording, make sure you already turned off Noise suppression, otherwise, it will not detect anything.\n**2.** Turn your Input sensitivity to the lowest if you can. It's optional, you don't need to do it.\n**3.** Don't worry about other people talking, the bot will only listen to you.\n**4.** After you click \"Start listening\" you will only have 5 seconds to play the song you want it to detect, so make sure don't miss the timing")
            .setFooter({ text: 'Press `Start Listening` button to start' })

        let start = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('startRecording')
                    .setStyle('SUCCESS')
                    .setLabel('Start Listening')
            )

        await interaction.editReply({ embeds: [embed], components: [start] });

        const filter = async i => i.user.id == member.id && i.message.id == (await interaction.fetchReply()).id && i.customId == 'startRecording';
        const collector = channel.createMessageComponentCollector({ filter, time: 120000 })

        collector.on('collect', async i => {
            await i.deferReply({ ephemeral: true });

            if (!i.member.voice.channel) return i.editReply({ content: 'You need to be in a voice channel to let me start listening!', ephemeral: true })

            if (userIds.indexOf(member.id) != -1) return i.editReply({ content: 'I am already listening to you!', ephemeral: true })

            let time = 5;

            function editMsg() {
                i.editReply({ embeds: [new MessageEmbed().setColor('GREEN').setTitle(`Listening...`).setDescription(`${time} seconds left`)] }).catch(() => { });
            }

            const connection = joinVoiceChannel({
                channelId: i.member.voice.channel.id,
                guildId: i.guild.id,
                selfDeaf: false,
                selfMute: false,
                adapterCreator: channel.guild.voiceAdapterCreator,
            })

            try {
                await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
            }
            catch {
                return i.editReply({ embeds: [new MessageEmbed().setColor('RED').setTitle("There is an error with checking state, please try again later!")] });
            }
            const receiver = connection.receiver;
            userIds.push(member.id);
            const opusStream = receiver.subscribe(member.id);

            let convertedAudio = ffmpeg(opusStream.pipe(new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 })))
                .inputFormat('s32le')
                .audioFrequency(44100)
                .audioChannels(1)
                .audioCodec('pcm_s16le')
                .format('wav')
                .audioFilters('volume=6')
                .pipe()

            let bufs = []

            convertedAudio.on('data', (chunk) => {
                bufs.push(chunk)
            })

            interaction.editReply({ components: [] }).catch(() => { })

            let interval = setInterval(async () => {
                if (time < 1) {
                    clearInterval(interval);
                    i.editReply({ embeds: [new MessageEmbed().setColor('BLUE').setTitle('Fetching data, please wait...')], components: [] })
                    opusStream.destroy();
                    userIds.splice(userIds.indexOf(member.id), 1);

                    const options = {
                        method: 'POST',
                        url: 'https://shazam.p.rapidapi.com/songs/detect',
                        headers: {
                            'content-type': 'text/plain',
                            'x-rapidapi-host': 'shazam.p.rapidapi.com',
                            'x-rapidapi-key': config.private.shazamKey
                        },
                        data: Buffer.concat(bufs).toString('base64')
                    };

                    axios.request(options).then(function (response) {
                        let track = response.data.track;
                        if (track) {
                            let btn = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setStyle('LINK')
                                        .setLabel('Listen Here')
                                        .setEmoji('928931707380461578')
                                        .setURL(track.url)
                                )
                            i.editReply({
                                embeds: [new MessageEmbed().setColor('GREEN').setThumbnail(`${track.images.background}`).setTitle('I found a match!').addFields(
                                    { name: `Song Name:`, value: `${track.title}`, inline: true },
                                    { name: `Artists`, value: `${track.subtitle}`, inline: true },
                                    { name: `Song Type`, value: `${track.genres.primary}`, inline: true },
                                )], components: [btn]
                            })
                        }
                        else {
                            i.editReply({ embeds: [new MessageEmbed().setColor('RED').setTitle("I'm sorry but I didn't find any matches, maybe try another part of the song")] });
                        }
                    }).catch(function (error) {
                        console.error(error);
                        i.editReply({ embeds: [new MessageEmbed().setColor('RED').setTitle('There is an error while fetching data, I\'ll fix it as fast as I can')] });
                    });
                }
                else {
                    editMsg();
                }
                time--;
            }, 1000);
        })
    },
};