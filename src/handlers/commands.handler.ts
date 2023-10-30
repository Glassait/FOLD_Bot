import { Client, REST, Routes  } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { token, client_id } from '../config.json';
import { SlashCommand } from "../utils/slash-command.class";

module.exports = async (client: Client): Promise<void> => {
    const slashCommandsDir: string = join(__dirname, '../slash-commands');
    const body: any[] = [];

    readdirSync(slashCommandsDir).forEach((file: string): void => {
        if (!file.endsWith('.js')) return;

        const command: SlashCommand = require(`${slashCommandsDir}/${file}`).command;

        console.log(`🔥 Successfully loaded command ${command.name}`);

        // client.slashCommands.set(command.name, command);
        body.push(command.data.toJSON());
    });

    const rest: REST = new REST({ version: '10' }).setToken(token);

    try {
        await rest.put(Routes.applicationCommands(client_id), {
            body: body,
        });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
};
