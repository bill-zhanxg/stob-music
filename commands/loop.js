const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Loop the songs!')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Choose the loop type!')
                .addChoices(
                    { name: 'Off', value: '0' },
                    { name: 'Track', value: '1' },
                    { name: 'Queue', value: '2' },
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        let { client, guild } = interaction;
        let option = interaction.options.getString('type');

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

        client.distube.setRepeatMode(guild, parseInt(option));
        interaction.editReply({
            embeds: [new MessageEmbed()
                .setColor("BLUE")
                .setTitle(`➿ Set repeat mode to: \`${option === '0' ? 'Off' : option === '1' ? 'Track' : 'Queue'}\``)]
        });
    },
};