const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jump')
        .setDescription('Jump to a song!'),
    async execute(interaction) {
        await interaction.deferReply();
        let { client, guild, channel } = interaction;

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

        let row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('jump')
                    .setPlaceholder('Select a song to jump to')
                    .addOptions([]),
            );

        let songs = client.distube.getQueue(guild).songs.slice(0, 21);
        songs.map((song, index) => {
            if (index != 0) {
                let name = song.name
                row.components[0].options.push({
                    label: name,
                    value: index.toString(),
                    description: null,
                    emoji: null,
                    default: false
                });
            }
        })

        if (row.components[0].options.length < 1) {
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setColor("RED")
                    .setTitle('❌ There is only one song in queue!')
                    .setDescription(`Please add more songs to queue`)
                ]
            });
            return;
        }

        interaction.editReply({
            embeds: [new MessageEmbed()
                .setColor("BLUE")
                .setTitle(`Please choose which song you want to jump to!`)],
            components: [row],
        });

        let filter = async i => i.message.id === (await interaction.fetchReply()).id && i.customId == 'jump';
        const collector = channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

        collector.on('collect', async i => {
            await i.deferReply();
            let index = parseInt(i.values[0]);
            try { client.distube.resume(guild); } catch { }
            client.distube.jump(guild, index).catch(() => { })
            i.deleteReply().catch(() => { });
        });

        collector.on('end', () => {
            interaction.deleteReply();
        })
    },
};