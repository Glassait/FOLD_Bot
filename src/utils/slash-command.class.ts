import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export class SlashCommand {
  private readonly _name: string;
  private readonly _data: SlashCommandBuilder;
  private readonly _execute: (interaction: ChatInputCommandInteraction) => Promise<void>;

  constructor(
    name: string,
    description: string,
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>
  ) {
    this._name = name;
    this._data = new SlashCommandBuilder()
      .setName(name)
      .setDescription(description);
    this._execute = execute;
  }

  public get name(): string {
    return this._name;
  }

  public get data(): SlashCommandBuilder {
    return this._data;
  }

  public get execute(): (
    interaction: ChatInputCommandInteraction
  ) => Promise<void> {
    return this._execute;
  }
}
