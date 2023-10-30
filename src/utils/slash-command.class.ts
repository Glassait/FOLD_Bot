import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { OptionType } from '../types/option.type';

export class SlashCommand {
    private readonly _name: string;
    private readonly _data: SlashCommandBuilder;
    private readonly _execute: (interaction: ChatInputCommandInteraction) => Promise<void>;

    constructor(
        name: string,
        description: string,
        execute: (interaction: ChatInputCommandInteraction) => Promise<void>,
        option?: OptionType,
        permission?: bigint
    ) {
        this._name = name;
        this._data = new SlashCommandBuilder().setName(name).setDescription(description);
        if (option) {
            switch (option.optionType) {
                case 'StringOption':
                    this._data.addStringOption(option.base);
                    break;
                case 'MentionableOption':
                    this._data.addMentionableOption(option.base);
                    break;
            }
        }

        if (permission) {
            this._data.setDefaultMemberPermissions(permission);
        }
        this._execute = execute;
    }

    public get name(): string {
        return this._name;
    }

    public get data(): SlashCommandBuilder {
        return this._data;
    }

    public get execute(): (interaction: ChatInputCommandInteraction) => Promise<void> {
        return this._execute;
    }
}
