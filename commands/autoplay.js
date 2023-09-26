const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoplay')
        .setDescription('Turn autoplay on/off!')
        .addBooleanOption(option =>
            option.setName('input')
                .setDescription('Turn autoplay on/off!')
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

        let input = interaction.options.getBoolean('input');
        if (input) {
            if (client.distube.toggleAutoplay(guild) == false) {
                client.distube.toggleAutoplay(guild);
                return interaction.editReply({ embeds: [new MessageEmbed().setColor('RED').setTitle("Autoplay is already on!")] });
            }
            interaction.editReply({ embeds: [new MessageEmbed().setColor('BLUE').setTitle("Turned on autoplay!")] });
        }
        else {
            if (client.distube.toggleAutoplay(guild) == true) {
                client.distube.toggleAutoplay(guild);
                return interaction.editReply({ embeds: [new MessageEmbed().setColor('RED').setTitle("Autoplay is already off!")] });
            }
            interaction.editReply({ embeds: [new MessageEmbed().setColor('BLUE').setTitle("Turned off autoplay!")] });
        }
    },
};