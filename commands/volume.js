const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Change the song volume!')
        .addIntegerOption(option =>
            option.setName('volume')
                .setDescription('1 - 300')
                .setMinValue(1)
                .setMaxValue(300)
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

        let vol = interaction.options.getInteger('volume');

        client.distube.setVolume(guild, vol);
        interaction.editReply({
            embeds: [new MessageEmbed()
                .setColor("BLUE")
                .setTitle(`🔊 I set the volume to: \`${vol}%\``)]
        });
    },
};