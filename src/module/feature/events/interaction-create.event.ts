import { Client, Events, Interaction } from 'discord.js';
import { BotEvent } from './types/bot-event.type';
import { Context } from '../../shared/classes/context';
import { Logger } from '../../shared/classes/logger';
import { SlashCommandModel } from '../slash-commands/model/slash-command.model';
import { EnvUtil } from '../../shared/utils/env.util';

const logger: Logger = new Logger(new Context('INTERACTION-CREATE-EVENT'));

function getCommand(interaction: { commandName: string }): SlashCommandModel | undefined {
    return require(`../slash-commands/${interaction.commandName}.slash-command`).command;
}

export const event: BotEvent = {
    name: Events.InteractionCreate,
    async execute(client: Client, interaction: Interaction): Promise<void> {
        if (interaction.isChatInputCommand()) {
            if (EnvUtil.isDev()) {
                await interaction.reply({
                    content:
                        "Je suis actuellement entrain d'être améliorer par mon créateur, cette commande ne fonctionne pas !\nMerci d'éssayer plus tard :)",
                    ephemeral: true,
                });
                return;
            }

            const command: SlashCommandModel | undefined = getCommand(interaction);

            if (!command) {
                logger.error(`No slash commands matching \`${interaction.commandName}\` was found.`);
                return;
            }

            try {
                logger.info(`Chat input command received : \`${command.name}\``);
                await command.execute(interaction, client);
            } catch (error) {
                logger.error(`${error}`, error);
            }
        } else if (interaction.isAutocomplete()) {
            const command: SlashCommandModel | undefined = getCommand(interaction);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(error);
            }
        }
    },
};
