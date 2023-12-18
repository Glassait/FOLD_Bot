import { Client, REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { client_id, token } from '../../../config.json';
import { Context } from '../../shared/classes/context';
import { Logger } from '../../shared/classes/logger';
import { SlashCommandModel } from '../slash-commands/model/slash-command.model';

const logger: Logger = new Logger(new Context('COMMANDS-HANDLER'));

module.exports = async (_client: Client): Promise<void> => {
    const slashCommandsDir: string = join(__dirname, '../slash-commands');
    const body: any[] = [];
    let numberOfCommand: number = 0;

    readdirSync(slashCommandsDir).forEach((file: string): void => {
        if (!file.endsWith('.ts')) return;

        const command: SlashCommandModel = require(`${slashCommandsDir}/${file}`).command;

        body.push(command.data.toJSON());
        numberOfCommand++;

        logger.info(`🔥 Successfully loaded command ${command.name}`);
    });

    const rest: REST = new REST({ version: '10' }).setToken(token);

    try {
        await rest.put(Routes.applicationCommands(client_id), {
            body: body,
        });

        logger.debug(`Successfully reloaded application ${numberOfCommand} slash-commands.`);
    } catch (error) {
        logger.error(`${error}`);
    }
};
