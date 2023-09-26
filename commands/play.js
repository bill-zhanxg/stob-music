const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song!')
        .addStringOption(option =>
            option.setName('song')
            .setDescription('The song to play!')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        let client = interaction.client;
        let vchannel = interaction.member.voice.channel;
        if (!vchannel) return interaction.editReply({ embeds: [new MessageEmbed().setTitle("You need to be in a voice channel to play music!").setColor("RED")] });
        if (!vchannel.permissionsFor(interaction.guild.me).has(Permissions.FLAGS.CONNECT)) return interaction.editReply({ embeds: [new MessageEmbed().setTitle("I cannot connect to your voice channel, make sure I have the proper permissions!").setColor("RED")] });
        interaction.editReply({
            embeds: [new MessageEmbed()
                .setTitle("Searching...🔍")]
        });
        client.distube.play(vchannel, interaction.options.getString('song'), { member: interaction.member, textChannel: interaction.channel });
    },
};