import type { Channel, ChatInputCommandInteraction, Client, CommandInteractionOption, Guild, GuildMember } from 'discord.js';
import type { Channel as ChannelType } from '../tables/complexe-table/channels/models/channels.type';

/**
 * Retrieves the guild member from the provided interaction option.
 *
 * @param {ChatInputCommandInteraction} interaction - The interaction object.
 * @param {string} optionName - The name of the option containing the user ID.
 * @param {boolean} [sendReplyIfError=false] - Whether to send a reply if an error occurs.
 *
 * @returns {Promise<GuildMember | undefined>} - A Promise that resolves with the guild member, if found.
 */
export async function getGuildMemberFromInteraction(
    interaction: ChatInputCommandInteraction,
    optionName: string,
    sendReplyIfError: boolean = false
): Promise<GuildMember | undefined> {
    const option: CommandInteractionOption | null = interaction.options.get(optionName);
    const guild: Guild | null = interaction.guild;
    const targetId: string | number | boolean | undefined = option?.value;

    if (!interaction.deferred) {
        await interaction.deferReply({
            ephemeral: true,
        });
    }

    if (!option || !guild || !targetId) {
        if (sendReplyIfError) {
            await interaction.editReply({
                content: 'Technical error :(',
            });
        }
        return;
    }

    try {
        return await guild.members.fetch(targetId.toString());
    } catch (error) {
        if (sendReplyIfError) {
            await interaction.editReply({
                content: "L'utilisateur n'existe pas !",
            });
        }
        return;
    }
}

/**
 * Get the text channel from the cache and if is not loaded, fetch it from the guild manager
 *
 * @param {Client} client - The Discord client instance.
 * @param {ChannelType} channel - The channel to fetch from the client.
 *
 * @returns {GChannel} - The Discord channel instance.
 *
 * @template GChannel - The type of channel fetch
 */
export async function fetchChannelFromClient<GChannel extends Channel>(client: Client, channel: ChannelType): Promise<GChannel> {
    const chan: GChannel | undefined = client.channels.cache.get(channel.channel_id) as GChannel | undefined;

    if (!chan) {
        const g: Guild = await client.guilds.fetch(channel.guild_id);
        return (await g.channels.fetch(channel.channel_id)) as GChannel;
    }

    return chan;
}
