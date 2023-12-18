import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { OptionMap, OptionType } from './option.type';

export class SlashCommand {
    private readonly _name: string;
    private readonly _data: SlashCommandBuilder;
    private readonly _execute: (interaction: ChatInputCommandInteraction) => Promise<void>;

    constructor(
        name: string,
        description: string,
        execute: (interaction: ChatInputCommandInteraction) => Promise<void>,
        option?: OptionType[],
        permission?: bigint
    ) {
        this._name = name;
        this._data = new SlashCommandBuilder().setName(name).setDescription(description);

        if (option) {
            option.forEach((value: OptionType): void => OptionMap[value.constructor.name](value, this._data));
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
