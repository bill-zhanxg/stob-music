const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { format } = require('../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settime')
        .setDescription('Set the playing time of the song!')
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('Seconds to set')
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
        if (num >= queue.songs[0].duration) num = queue.songs[0].duration;

        client.distube.seek(guild, num);
        interaction.editReply({
            embeds: [new MessageEmbed()
                .setColor("BLUE")
                .setTitle(`🕙 Set the time to: ${format(num * 1000)}`)
                .setDescription("Please wait a few seconds to let the bot process")]
        });
    },
};