const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('View server queue!'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
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

        let queue = client.distube.getQueue(guild);

        let counter = 0;
        for (i = 0; i < queue.songs.length; i += 20) {
            let embed = new MessageEmbed()
                .setColor("BLUE")

            let k = queue.songs;
            let songs = k.slice(i, i + 20);
            if (counter === 0) embed.setTitle(`Queue for: ${guild.name}`);
            if (counter === Math.floor(queue.songs.length / 20)) embed.addField("Status: ", `Volume: \`${queue.volume}%\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "Queue" : "Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\` | Filters: \`${queue.filters.join(', ') || "Clear"}\` | Duration: \`${queue.formattedDuration}\``);
            interaction.followUp({ embeds: [embed.setDescription(songs.map((song, index) => `**${index + 1 + counter * 20}.** [${song.name}](${song.url}) - ${song.formattedDuration}`).join("\n"))], ephemeral: true });
            counter++;
        }
    },
};