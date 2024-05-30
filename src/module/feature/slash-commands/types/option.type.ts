import type { SlashCommandMentionableOption, SlashCommandStringOption } from '@discordjs/builders';
import type { SlashCommandBuilder, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandSubcommandBuilder } from 'discord.js';

/**
 * Define all slash commands options used.
 *
 * Don't forget to update to the {@link OptionMap} when updating this type
 */
export type OptionType =
    | SlashCommandStringOption
    | SlashCommandIntegerOption
    | SlashCommandMentionableOption
    | SlashCommandSubcommandBuilder
    | SlashCommandChannelOption;

/**
 * Define all discord option, according to the {@link OptionType}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const OptionMap: Record<string, (value: any, data: SlashCommandBuilder) => void> = {
    SlashCommandStringOption: (value: SlashCommandStringOption, data: SlashCommandBuilder) => data.addStringOption(value),
    SlashCommandIntegerOption: (value: SlashCommandIntegerOption, data: SlashCommandBuilder) => data.addIntegerOption(value),
    SlashCommandMentionableOption: (value: SlashCommandMentionableOption, data: SlashCommandBuilder) => data.addMentionableOption(value),
    SlashCommandSubcommandBuilder: (value: SlashCommandSubcommandBuilder, data: SlashCommandBuilder) => data.addSubcommand(value),
    SlashCommandChannelOption: (value: SlashCommandChannelOption, data: SlashCommandBuilder) => data.addChannelOption(value),
};
