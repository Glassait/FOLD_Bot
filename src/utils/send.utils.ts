import { ChatInputCommandInteraction, InteractionEditReplyOptions, InteractionReplyOptions, MessagePayload, TextBasedChannel } from 'discord.js';
import { LoggerSingleton } from '../singleton/logger.singleton';

export class SendUtils {
    private static readonly logger: LoggerSingleton = LoggerSingleton.instance;
    private static readonly context: string = SendUtils.name;

    /**
     * Method create to log the reply of an interaction
     * @param interaction The interaction
     * @param options The reply option
     */
    public static async reply(interaction: ChatInputCommandInteraction, options: string | MessagePayload | InteractionReplyOptions): Promise<void> {
        this.logger.trace(this.context, `Interaction reply with \`${JSON.stringify(options)}\` to the channel \`${interaction.channel?.id}\``);
        await interaction.reply(options);
    }

    /**
     * Method create to log the editReply of an interaction
     * @param interaction The interaction
     * @param options The reply option
     */
    public static async editReply(interaction: ChatInputCommandInteraction, options: string | MessagePayload | InteractionEditReplyOptions): Promise<void> {
        this.logger.trace(this.context, `Interaction reply edit with \`${JSON.stringify(options)}\` to the channel \`${interaction.channel?.id}\``);
        await interaction.editReply(options);
    }

    /**
     * Method create to log the message send to a channel
     * @param channel The channel to send the message
     * @param message The message to send
     */
    public static async send(channel: TextBasedChannel, message: string): Promise<void> {
        this.logger.trace(this.context, `Message send to the channel \`${channel.id}\` with message \`${message}\``);
        await channel.send(message);
    }
}
