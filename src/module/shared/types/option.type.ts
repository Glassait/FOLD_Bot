import { SlashCommandMentionableOption, SlashCommandStringOption } from '@discordjs/builders';

/**
 * Define all slash commands options used
 */
export type OptionType = { optionType: 'StringOption'; base: SlashCommandStringOption } | { optionType: 'MentionableOption'; base: SlashCommandMentionableOption };
