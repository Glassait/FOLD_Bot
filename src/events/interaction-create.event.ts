import { ChatInputCommandInteraction, Client, Events, Interaction } from 'discord.js';
import { BotEvent } from '../types/bot-event.type';
import { SlashCommand } from '../utils/slash-command.class';

function getCommand(interaction: ChatInputCommandInteraction): SlashCommand | undefined {
    return require(`../slash-commands/${interaction.commandName}.slash-command`).command;
}

const event: BotEvent = {
    name: Events.InteractionCreate,
    once: false,
    async execute(_client: Client, interaction: Interaction): Promise<void> {
        let command: SlashCommand | undefined;

        if (interaction.isChatInputCommand()) {
            command = getCommand(interaction);

            if (!command) {
                console.error(`No slash commands matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.log(error);
            }
        }
    },
};

export default event;
