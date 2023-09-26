const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the queue!'),
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

        client.distube.shuffle(guild);
        interaction.editReply({
            embeds: [new MessageEmbed()
                .setColor("BLUE")
                .setTitle(`🔀 Shuffled the Queue!`)]
        });
    },
};