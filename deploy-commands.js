const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const config = require('./config.json');

let token = config.private.token;
let clientId = config.clientId;
let guildId = config.guildId;
let folder = "commands";
let deletes = config.deleteSlashCommand;
let global = !config.debug;

module.exports = async () => {
    const commands = [];
    const commandFiles = fs.readdirSync(`./${folder}`).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./${folder}/${file}`);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(token);
    
    if (deletes) {
        await rest.get(Routes.applicationGuildCommands(clientId, guildId))
            .then(data => {
                for (const command of data) {
                    const deleteUrl = `${Routes.applicationGuildCommands(clientId, guildId)}/${command.id}`;
                    rest.delete(deleteUrl)
                }

                console.log('Successfully deleted all guild slash commands.');
            });

        await rest.get(Routes.applicationCommands(clientId))
            .then(data => {
                for (const command of data) {
                    const deleteUrl = `${Routes.applicationCommands(clientId)}/${command.id}`;
                    rest.delete(deleteUrl)
                }

                console.log('Successfully deleted all global slash commands.');
            });
    }

    if (global) {
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );
    }
    else {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
    }

    console.log('Successfully reloaded all slash commands.');
}