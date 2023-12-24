import { SlashCommandMentionableOption, SlashCommandStringOption } from '@discordjs/builders';
import { SlashCommandBuilder } from 'discord.js';

/**
 * Define all slash commands options used.
 * ! Don't forget to update to the {@link OptionMap} when updating this type
 */
export type OptionType = SlashCommandStringOption | SlashCommandMentionableOption;

/**
 * Define all discord option, according to the {@link OptionType}
 */
export const OptionMap: Record<string, (value: any, data: SlashCommandBuilder) => void> = {
    SlashCommandStringOption: (value: any, data: SlashCommandBuilder) => data.addStringOption(value),
    SlashCommandMentionableOption: (value: any, data: SlashCommandBuilder) => data.addMentionableOption(value),
};
