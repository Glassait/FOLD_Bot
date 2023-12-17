import { ChatInputCommandInteraction, Client, Events, Interaction } from 'discord.js';
import { BotEvent } from '../../shared/types/bot-event.type';
import { Context } from '../../shared/classes/context';
import { EnvUtil } from '../../shared/utils/env.util';
import { SlashCommand } from '../../shared/classes/slash-command';
import { Logger } from '../../shared/classes/logger';

const logger: Logger = new Logger(new Context('INTERACTION-CREATE-EVENT'));

function getCommand(interaction: ChatInputCommandInteraction): SlashCommand | undefined {
    return require(`../slash-commands/${interaction.commandName}.slash-command`).command;
}

const event: BotEvent = {
    name: Events.InteractionCreate,
    once: false,
    async execute(_client: Client, interaction: Interaction): Promise<void> {
        let command: SlashCommand | undefined;

        if (interaction.isChatInputCommand()) {
            if (EnvUtil.isDev()) {
                await interaction.reply({
                    content:
                        "Je suis actuellement entrain d'être améliorer par mon créateur, cette commande ne fonctionne pas !\nMerci d'éssayer plus tard :)",
                    ephemeral: true,
                });
                return;
            }

            command = getCommand(interaction);

            if (!command) {
                logger.error(`No slash commands matching \`${interaction.commandName}\` was found.`);
                return;
            }

            try {
                logger.trace(`Chat input command received : \`${command.name}\``);
                await command.execute(interaction);
            } catch (error) {
                logger.error(`${error}`);
            }
        }
    },
};

export default event;
