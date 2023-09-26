const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused song!'),
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
            await client.distube.resume(guild)
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle(`▶ Resumed the music for you!`)]
            });
        }
        catch {
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setColor("RED")
                    .setTitle('❌ The song is already playing!')
                    .setDescription(`Please pause the song first`)
                ]
            })
        }
    },
};