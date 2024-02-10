import { SlashCommandBuilder } from 'discord.js';
import { OptionMap, OptionType } from '../types/option.type';
import { CallbackCommand } from '../types/command.type';

/**
 * Represents a model for a slash command.
 */
export class SlashCommandModel {
    /**
     * The name of the slash command.
     * @private
     */
    private readonly _name: string;

    /**
     * The slash command data.
     * @private
     */
    private readonly _data: SlashCommandBuilder;

    /**
     * The callback function to be executed when the slash command is invoked.
     * @private
     */
    private readonly _execute: CallbackCommand;

    /**
     * The callback function for slash command autocompletion.
     * @private
     */
    private readonly _autocomplete: CallbackCommand;

    /**
     * Creates a new instance of SlashCommandModel.
     * @param {string} name - The name of the slash command.
     * @param {string} description - The description of the slash command.
     * @param {CallbackCommand} execute - The callback function to be executed.
     * @param {object} [optional={}] - Optional configuration parameters.
     * @param {CallbackCommand} optional.autocomplete - The callback function for autocompletion.
     * @param {OptionType[]} optional.option - An array of option types.
     * @param {bigint} optional.permission - The default member permissions for the slash command.
     */
    constructor(
        name: string,
        description: string,
        execute: CallbackCommand,
        optional: {
            autocomplete?: CallbackCommand;
            option?: OptionType[];
            permission?: bigint;
        } = {}
    ) {
        this._name = name;
        this._data = new SlashCommandBuilder().setName(name).setDescription(description);

        if (optional.option) {
            optional.option.forEach((value: OptionType): void => OptionMap[value.constructor.name](value, this._data));
        }

        if (optional.permission) {
            this._data.setDefaultMemberPermissions(optional.permission);
        }

        if (optional.autocomplete) {
            this._autocomplete = optional.autocomplete;
        }
        this._execute = execute;
    }

    /**
     * Gets the name of the slash command.
     * @returns {string} - The name of the slash command.
     */
    public get name(): string {
        return this._name;
    }

    /**
     * Gets the slash command data.
     * @returns {SlashCommandBuilder} - The slash command data.
     */
    public get data(): SlashCommandBuilder {
        return this._data;
    }

    /**
     * Gets the callback function to be executed when the slash command is invoked.
     * @returns {CallbackCommand} - The callback function for execution.
     */
    public get execute(): CallbackCommand {
        return this._execute;
    }

    /**
     * Gets the callback function for slash command autocompletion.
     * @returns {CallbackCommand} - The callback function for autocompletion.
     */
    public get autocomplete(): CallbackCommand {
        return this._autocomplete;
    }
}
