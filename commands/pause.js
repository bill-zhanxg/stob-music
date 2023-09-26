const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current song!'),
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
        
        try {
            await client.distube.pause(guild)
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle(`⏸ Paused the music for you!`)]
            });
        }
        catch {
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setColor("RED")
                    .setTitle('❌ The song is already paused!')
                    .setDescription(`Please resume the song first`)
                ]
            })
        }
    },
};