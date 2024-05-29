import { REST, type RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, type Snowflake } from 'discord.js';
import { readdirSync } from 'fs';
import { basename } from 'node:path';
import { join } from 'path';
import { client_id, token } from '../../core/config.json';
import { EmojiEnum } from '../../shared/enums/emoji.enum';
import { CommandsTable } from '../../shared/tables/complexe-table/commands/commands.table';
import type { CommandName } from '../../shared/tables/complexe-table/commands/models/commands.type';
import { Logger } from '../../shared/utils/logger';
import type { SlashCommandModel } from '../slash-commands/models/slash-command.model';

module.exports = async (): Promise<void> => {
    const logger: Logger = new Logger(basename(__filename));
    const slashCommandsDir: string = join(__dirname, '../slash-commands');
    const body: Record<Snowflake, RESTPostAPIChatInputApplicationCommandsJSONBody[]> = {};
    const commandsTable = new CommandsTable();

    for (const file of readdirSync(slashCommandsDir)) {
        if (!file.endsWith('.ts')) {
            continue;
        }

        const command: SlashCommandModel = require(`${slashCommandsDir}/${file}`) as SlashCommandModel;

        (await commandsTable.getCommand(command.name as CommandName)).forEach((serverId: string): void => {
            const guild: RESTPostAPIChatInputApplicationCommandsJSONBody[] = body[serverId] ?? [];
            guild.push(command.data.toJSON());
            body[serverId] = guild;
        });

        logger.info(`${EmojiEnum.FLAME} Successfully loaded command {}`, command.name);
    }

    const rest: REST = new REST({ version: '10' }).setToken(token);

    for (const [serverId, command] of Object.entries(body)) {
        try {
            await rest.put(Routes.applicationGuildCommands(client_id, serverId), { body: command });

            logger.info('Successfully reloaded application {} slash-commands for guild {}', String(command.length), serverId);
        } catch (error) {
            logger.error(`An error occur during registering slash-command`, error);
        }
    }
};
