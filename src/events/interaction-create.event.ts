import { Client, Events, Interaction } from 'discord.js';
import { BotEvent } from '../types/bot-event.type';
import { SlashCommand } from '../utils/slash-command.class';

function getCommand(interaction: any): SlashCommand | undefined {
    const command = interaction.client.slashCommands.get(interaction.commandName);

    if (!command) {
        console.error(`No slash commands matching ${interaction.commandName} was found.`);
        return;
    }

    return command;
}

const event: BotEvent = {
    name: Events.InteractionCreate,
    once: false,
    async execute(_client: Client, interaction: Interaction) {
        let command;

        if (interaction.isChatInputCommand()) {
            command = getCommand(interaction);

            try {
                await command?.execute(interaction);
            } catch (error) {
                console.log(error);
            }
        }
    },
};

export default event;
