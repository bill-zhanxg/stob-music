const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions, MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('searchplay')
        .setDescription('Search and play the selected song!')
        .addStringOption(option =>
            option.setName('song')
            .setDescription('The song to search play!')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply();
        let { client, guild, member, channel } = interaction;
        
        let vchannel = member.voice.channel;
        if (!vchannel) return interaction.editReply({ embeds: [new MessageEmbed().setTitle("You need to be in a voice channel to play music!").setColor("RED")] });
        if (!vchannel.permissionsFor(guild.me).has(Permissions.FLAGS.CONNECT)) return interaction.editReply({ embeds: [new MessageEmbed().setTitle("I cannot connect to your voice channel, make sure I have the proper permissions!").setColor("RED")] });
        let song = interaction.options.getString('song');

        let row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('searchplay')
                    .setPlaceholder('Select the song you want to play')
                    .addOptions([]),
            );

        client.distube.search(song).then(async (result) => {
            for (const song of result) {
                row.components[0].options.push({
                    label: song.name,
                    value: song.url,
                    description: null,
                    emoji: null,
                    default: false
                });
            }

            let msg = await interaction.editReply({
                embeds: [new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle(`Please select the song you want to play!`)],
                components: [row],
            });

            let filter = async i => i.message.id == (await interaction.fetchReply()).id && i.user.id == member.id;
            const collector = channel.createMessageComponentCollector({ time: 120000, filter, max: 1 });

            collector.on('collect', i => {
                if (i.customId == 'searchplay') {
                    let url = i.values[0];
                    try {
                        if (!member.voice.channel) return channel.send({ embeds: [new MessageEmbed().setTitle("Why did you leave the voice channel and want me to be in it?!").setColor("RED")] });
                        client.distube.play(member.voice.channel, url, { member: member, textChannel: channel })
                    }
                    catch {
                        msg.reply('There is an error while I try to play the song!')
                    }
                }
            });

            collector.on('end', collected => {
                interaction.deleteReply().catch(() => { });
            });
        }).catch(() => interaction.editReply({ embeds: [new MessageEmbed().setTitle('No result found').setColor("RED")] }))
    },
};