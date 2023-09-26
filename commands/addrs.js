const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrs')
        .setDescription('Add Related Song!'),
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

        client.distube.addRelatedSong(guild).then((song) => {
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setTitle("Added :thumbsup: " + song.name)
                    .setURL(song.url)
                    .setColor("BLUE")
                    .addField("Song Duration", `\`${song.formattedDuration}\``)
                    .setThumbnail(song.thumbnail)
                    .setFooter({ text: `Requested by: ${song.user.tag}`, iconURL: song.user.displayAvatarURL({ dynamic: true }) })]
            });
        }).catch(() => { });
    },
};