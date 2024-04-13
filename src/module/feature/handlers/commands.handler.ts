import { REST, type RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, type Snowflake } from 'discord.js';
import { readdirSync } from 'fs';
import { basename } from 'node:path';
import { join } from 'path';
import { client_id, token } from '../../core/config.json';
import { Logger } from '../../shared/classes/logger';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { InventorySingleton } from '../../shared/singleton/inventory.singleton';
import type { SlashCommandModel } from '../slash-commands/model/slash-command.model';

module.exports = async (): Promise<void> => {
    const logger: Logger = new Logger(basename(__filename));
    const inventory: InventorySingleton = InventorySingleton.instance;
    const slashCommandsDir: string = join(__dirname, '../slash-commands');
    const body: { [key: Snowflake]: RESTPostAPIChatInputApplicationCommandsJSONBody[] } = {};

    readdirSync(slashCommandsDir).forEach((file: string): void => {
        if (!file.endsWith('.ts')) return;

        const command: SlashCommandModel = require(`${slashCommandsDir}/${file}`);
        inventory.getCommands(command.name).forEach((value: string): void => {
            const guild: RESTPostAPIChatInputApplicationCommandsJSONBody[] = body[value] ?? [];
            guild.push(command.data.toJSON());
            body[value] = guild;
        });

        logger.info(`${EmojiEnum.FLAME} Successfully loaded command {}`, command.name);
    });

    const rest: REST = new REST({ version: '10' }).setToken(token);

    for (const [serverId, command] of Object.entries(body)) {
        try {
            await rest.put(Routes.applicationGuildCommands(client_id, serverId), { body: command });

            logger.info('Successfully reloaded application {} slash-commands for guild {}', String(command.length), serverId);
        } catch (error) {
            logger.error(`${error}`, error);
        }
    }
};
