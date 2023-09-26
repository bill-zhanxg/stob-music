const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { format } = require('../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forward')
        .setDescription('Forward the song!')
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('Seconds to forward!')
                .setMinValue(0)
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        let { client, guild } = interaction;

        if (!client.distube.getQueue(guild)) {
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setColor("RED")
                    .setTitle('❌ There is nothing playing!')
                    .setDescription(`The Queue is empty`)
                ]
            });
            return;
        }

        let num = interaction.options.getInteger('time');
        let queue = client.distube.getQueue(guild);
        let time = queue.currentTime + num;
        if (time >= queue.songs[0].duration) time = queue.songs[0].duration;

        let fwtime = Math.round(time - queue.currentTime).toString();
        client.distube.seek(guild, time);
        interaction.editReply({
            embeds: [new MessageEmbed()
                .setColor("BLUE")
                .setTitle(`⏩ Forwarded for: \`${fwtime} seconds\` to: ${format(time * 1000)}`)
                .setDescription("Please wait a few seconds to let the bot process")]
        });
    },
};