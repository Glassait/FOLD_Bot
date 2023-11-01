import { ChatInputCommandInteraction, Client, Events, GuildMember, VoiceState } from 'discord.js';
import { FeatureSingleton } from '../singleton/feature.singleton';
import { BotEvent } from '../types/bot-event.type';
import { SlashCommand } from '../utils/slash-command.class';
import { UserUtils } from '../utils/user.utils';

function getCommand(interaction: ChatInputCommandInteraction): SlashCommand | undefined {
    return require(`../slash-commands/${interaction.commandName}.slash-command`).command;
}

const event: BotEvent = {
    name: Events.VoiceStateUpdate,
    once: false,
    async execute(_client: Client, _oldState: VoiceState, newState: VoiceState): Promise<void> {
        const feature: FeatureSingleton = FeatureSingleton.instance;
        if (feature.data.auto_disconnect && newState.channelId) {
            const targetUser: GuildMember = await UserUtils.getGuildMemberFromGuild(
                newState.guild,
                feature.data.auto_disconnect
            );
            await targetUser.voice.disconnect();
        }
    },
};

export default event;
