const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current playing song!'),
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

        client.distube.skip(guild).then(() => {
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle(`⏭️ Skipped!`)]
            });
        }).catch(() => interaction.editReply({ embeds: [new MessageEmbed().setTitle('There is no up next song').setColor("RED")] }));
    },
};