const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Send Stob YouTube help page!'),
    async execute(interaction) {
        let music = new MessageEmbed()
            .setAuthor({ name: "Stob YouTube commands:", iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
            .setColor("BLUE")
            .setDescription('This is Stob YouTube. If you want the main Stob, click [here](https://bill-zhanxg)')
            .addFields(
                { name: `**Add Related Song**`, value: `\`/addrs\`` },
                { name: `**Turn autoplay on/off**`, value: `\`/autoplay <True/False>\`` },
                { name: `**Apply a(some) filters**`, value: `\`/filter\`` },
                { name: `**Forward the song**`, value: `\`/forward <Seconds>\`` },
                { name: `**Get the song by listening(song recognizer powered by shazam)**`, value: `\`/getsong\`` },
                { name: `**Jump to a song**`, value: `\`/jump\`` },
                { name: `**Leave the voice channel**`, value: `\`/leave\`` },
                { name: `**Loop the songs**`, value: `\`/loop <Off/Track/Queue>\`` },
                { name: `**Show the lyric of a song**`, value: `\`/lyric <Song>\`` },
                { name: `**Pause the current song**`, value: `\`/pause\`` },
                { name: `**Play a song or playlist** *(support Spotify, SoundCloud, YouTube, Netflix and more)*`, value: `\`/play <URL/Name>\`` },
                { name: `**Play the previous song**`, value: `\`/playpre\`` },
                { name: `**View server queue**`, value: `\`/queue\`` },
                { name: `**Resume the paused song**`, value: `\`/resume\`` },
                { name: `**Search for a video(download audio/video)**`, value: `\`/search <Video>\`` },
                { name: `**Search and play the selected song**`, value: `\`/searchplay <Song>\`` },
                { name: `**Set the playing time of the song**`, value: `\`/settime <Seconds>\`` },
                { name: `**Shuffle the queue**`, value: `\`/shuffle\`` },
                { name: `**Turn on/off silent mode**`, value: `\`/silent <True/False>\`` },
                { name: `**Skip the current playing song**`, value: `\`/skip\`` },
                { name: `**Show all the controls:**\n`, value: `\`/song\`\n**\`🔁 = Change loop type, ⏮️ = Play the previous song, ⏸ = Pause/Play, ⏭️ = Play the next song, 🔀 = Shuffle the queue, 🔔 = Turn silent mode on/off, 🎶 = View the queue, 🔉 = Change the volume, 📄 = Show the lyric of the current playing song, 🚪 = Leave\`**` },
                { name: `**Change the song volume**`, value: `\`/volume <0 - 300>\`` },
            )

        interaction.reply({ ephemeral: true, embeds: [music] });
    },
};