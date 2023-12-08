import { SlashCommandMentionableOption, SlashCommandStringOption } from '@discordjs/builders';

export type OptionType =
    | { optionType: 'StringOption'; base: SlashCommandStringOption }
    | { optionType: 'MentionableOption'; base: SlashCommandMentionableOption };
