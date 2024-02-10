import { ChatInputCommandInteraction, Client } from 'discord.js';

export type CallbackCommand = (interaction: ChatInputCommandInteraction, client?: Client) => Promise<void>;
