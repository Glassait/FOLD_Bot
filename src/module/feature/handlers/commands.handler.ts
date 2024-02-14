import { Client, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, Snowflake } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { client_id, token } from '../../core/config.json';
import { Context } from '../../shared/classes/context';
import { Logger } from '../../shared/classes/logger';
import { SlashCommandModel } from '../slash-commands/model/slash-command.model';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import { EmojiEnum } from '../../shared/enums/emoji.enum';

module.exports = async (_client: Client): Promise<void> => {
    const logger: Logger = new Logger(new Context('COMMANDS-HANDLER'));
    const inventory: InventorySingleton = InventorySingleton.instance;
    const slashCommandsDir: string = join(__dirname, '../slash-commands');
    const body: { [key: Snowflake]: RESTPostAPIChatInputApplicationCommandsJSONBody[] } = {};

    readdirSync(slashCommandsDir).forEach((file: string): void => {
        if (!file.endsWith('.ts')) return;

        const command: SlashCommandModel = require(`${slashCommandsDir}/${file}`).command;
        inventory.getCommands(command.name).forEach((value: string): void => {
            const guild = body[value] ?? [];
            guild.push(command.data.toJSON());
            body[value] = guild;
        });

        logger.info(`${EmojiEnum.FLAME} Successfully loaded command ${command.name}`);
    });

    const rest: REST = new REST({ version: '10' }).setToken(token);

    for (const entry of Object.entries(body)) {
        try {
            await rest.put(Routes.applicationGuildCommands(client_id, entry[0]), {
                body: entry[1],
            });

            logger.info(`Successfully reloaded application ${entry[1].length} slash-commands for guild ${entry[0]}`);
        } catch (error) {
            logger.error(`${error}`, error);
        }
    }
};
