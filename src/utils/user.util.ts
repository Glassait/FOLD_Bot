import {
    ChatInputCommandInteraction,
    CommandInteractionOption,
    Guild,
    GuildMember,
} from 'discord.js';

export class UserUtil {
    public static async getGuildMemberFromInteraction(
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

        const targetUser: GuildMember = await guild.members.fetch(targetId.toString());

        if (!targetUser) {
            if (sendReplyIfError) {
                await interaction.editReply({
                    content: "L'utilisateur n'existe pas !",
                });
            }
            return;
        }

        return targetUser;
    }

    public static async getGuildMemberFromGuild(
        guild: Guild,
        userId: string
    ): Promise<GuildMember> {
        return await guild.members.fetch(userId);
    }
}
