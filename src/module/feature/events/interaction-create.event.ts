import { ChatInputCommandInteraction, Client, Events, Interaction } from 'discord.js';
import { BotEvent } from './types/bot-event.type';
import { Context } from '../../shared/classes/context';
import { EnvUtil } from '../../shared/utils/env.util';
import { Logger } from '../../shared/classes/logger';
import { SlashCommandModel } from '../slash-commands/model/slash-command.model';

const logger: Logger = new Logger(new Context('INTERACTION-CREATE-EVENT'));

function getCommand(interaction: ChatInputCommandInteraction): SlashCommandModel | undefined {
    return require(`../slash-commands/${interaction.commandName}.slash-command`).command;
}

export const event: BotEvent = {
    name: Events.InteractionCreate,
    async execute(client: Client, interaction: Interaction): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return;
        }

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
            logger.trace(`Chat input command received : \`${command.name}\``);
            await command.execute(interaction, client);
        } catch (error) {
            logger.error(`${error}`);
        }
    },
};
