import { Client, REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { client_id, token } from '../config.json';

module.exports = async (_client: Client): Promise<void> => {
    const slashCommandsDir: string = join(__dirname, '../slash-commands');
    const body: any[] = [];

    readdirSync(slashCommandsDir).forEach((file: string): void => {
        if (!file.endsWith('.ts')) return;

        const command = require(`${slashCommandsDir}/${file}`).command;

        body.push(command.data.toJSON());

        console.log(`🔥 Successfully loaded command ${command.name}`);
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
