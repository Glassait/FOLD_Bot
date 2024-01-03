import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { OptionMap, OptionType } from '../types/option.type';

/**
 * This class is used to build slash-command and make it easy to register
 */
export class SlashCommandModel {
    /**
     * The name of the slash-command
     * @private
     */
    private readonly _name: string;
    /**
     * The discord js slash-command
     * @private
     */
    private readonly _data: SlashCommandBuilder;
    /**
     * The callback to execute when the slash-command is used
     * @private
     */
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

    /**
     * Getter for {@link name}
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Getter for {@link data}
     */
    public get data(): SlashCommandBuilder {
        return this._data;
    }

    /**
     * Getter for {@link execute}
     */
    public get execute(): (interaction: ChatInputCommandInteraction) => Promise<void> {
        return this._execute;
    }
}
