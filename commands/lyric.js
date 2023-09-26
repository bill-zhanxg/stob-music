const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const lyricsParse = require('../lyrics');
const functions = require('../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lyric')
        .setDescription('Show the lyric of a song!')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('The song to show lyric!')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        let song = interaction.options.getString('song');

        const lyrics = await lyricsParse(song);
        if (lyrics) {
            let texts = functions.formatText(lyrics);

            let count = 0;
            for (let text of texts) {
                let embed = new MessageEmbed()
                    .setColor("BLUE")
                    .setDescription(`\`\`\`${text}\`\`\``)

                if (count === 0) embed.setTitle(`🎶 Here is the lyric for ${song}`);
                interaction.followUp({ embeds: [embed], ephemeral: true });
                count++;
            }
        }
        else {
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setColor("RED")
                    .setTitle('❌ No Lyrics Found!')
                    .setDescription(`Please try search something else`)
                ]
            });
        }
    },
};