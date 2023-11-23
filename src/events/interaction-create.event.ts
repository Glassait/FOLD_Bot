import { ChatInputCommandInteraction, Client, Events, Interaction } from 'discord.js';
import { LoggerSingleton } from '../singleton/logger.singleton';
import { BotEvent } from '../types/bot-event.type';
import { Context } from '../utils/context.class';
import { EnvUtil } from '../utils/env.util';
import { SlashCommand } from '../utils/slash-command.class';

const logger: LoggerSingleton = LoggerSingleton.instance;
const context: Context = new Context('INTERACTION-CREATE-EVENT');

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
                        "Je suis actuellement entrain d'être améliorer par mon créateur. Cette commande ne fonctionne pas !",
                    ephemeral: true,
                });
                return;
            }

            command = getCommand(interaction);

            if (!command) {
                logger.error(
                    context.context,
                    `No slash commands matching ${interaction.commandName} was found.`
                );
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                logger.error(context.context, `${error}`);
            }
        }
    },
};

export default event;
