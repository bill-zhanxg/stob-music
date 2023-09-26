const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playpre')
        .setDescription('Play the previous song!'),
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
            await client.distube.previous(guild);
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setTitle("Playing previous song...🔍")]
            });
        }
        catch {
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setColor("RED")
                    .setTitle('❌ There is no previous song!')
                ]
            });
        }
    },
};