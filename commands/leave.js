const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave the voice channel!'),
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
        
        client.distube.stop(guild).then(() => {
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle(`🚪 Left!`)]
            });
        })
    },
};