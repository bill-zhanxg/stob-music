const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const options = [
    { name: 'Weird', value: 'funny' },
    { name: 'Reverse', value: 'reverse' },
    { name: '3d', value: '3d' },
    { name: 'Bass Boost', value: 'bassboost' },
    { name: 'Surround', value: 'surround' },
    { name: 'Nightcore', value: 'nightcore' },
    { name: 'Echo', value: 'echo' },
    { name: 'Karaoke', value: 'karaoke' },
    { name: 'Vaporwave', value: 'vaporwave' },
    { name: 'Flanger', value: 'flanger' },
    { name: 'Gate', value: 'gate' },
    { name: 'Haas', value: 'haas' },
    { name: 'Mcompand', value: 'mcompand' },
    { name: 'Phaser', value: 'phaser' },
    { name: 'Tremolo', value: 'tremolo' },
    { name: 'Earwax', value: 'earwax' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter')
        .setDescription('Apply filters!')
        .addStringOption(option =>
            option.setName('1')
                .setDescription('First filter')
                .addChoices({ name: 'Clear', value: 'clear' }, ...options)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('2')
                .setDescription('Seconds filter')
                .addChoices(...options)
        )
        .addStringOption(option =>
            option.setName('3')
                .setDescription('Third filter')
                .addChoices(...options)
        )
        .addStringOption(option =>
            option.setName('4')
                .setDescription('Fourth filter')
                .addChoices(...options)
        )
        .addStringOption(option =>
            option.setName('5')
                .setDescription('Fifth filter')
                .addChoices(...options)
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

        let totalFilters = [interaction.options.getString('1')];
        for (let i = 2; i < 5; i++) {
            let filter = interaction.options.getString(`${i}`);
            if (filter && !totalFilters.includes(filter)) totalFilters.push(filter);
        }

        client.distube.setFilter(guild, false);
        for (let filter of totalFilters) {
            if (filter === 'clear') break;
            client.distube.setFilter(guild, filter);
        }

        if (totalFilters.length === 1 || totalFilters[0] === 'clear') {
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle(`I set the filter to: \`${totalFilters[0]}\``)
                    .setDescription("Please wait a few seconds to let the bot process")]
            });
        }
        else {
            interaction.editReply({
                embeds: [new MessageEmbed()
                    .setColor("BLUE")
                    .setTitle("This may take a while")
                    .setDescription(`I set the filters includes: \`${totalFilters.join(', ')}\``)]
            });
        }
    },
};