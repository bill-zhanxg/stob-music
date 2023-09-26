const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('silent')
        .setDescription('Stop the bot from spamming "Now Playing"!')
        .addBooleanOption(option =>
            option.setName('input')
                .setDescription('Turn messages on/off!')
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

        let guildId = guild.id;
        let mode = interaction.options.getBoolean('input');
        let isOn = client.silent.indexOf(guildId) == -1 ? false : true;
        if (mode) {
            if (isOn) return interaction.editReply({ embeds: [new MessageEmbed().setTitle('Silent mode is already on!').setColor("RED")] });
            client.silent.push(guildId);
            interaction.editReply({ embeds: [new MessageEmbed().setTitle('Turned on silent mode!').setColor("GREEN")] });
        }
        else {
            if (!isOn) return interaction.editReply({ embeds: [new MessageEmbed().setTitle('Silent mode is already off!').setColor("RED")] });
            client.silent.splice(client.silent.indexOf(guildId), 1);
            interaction.editReply({ embeds: [new MessageEmbed().setTitle('Turned off silent mode!').setColor("GREEN")] });
        }
    },
};