import { Client, Events, GuildMember, VoiceState } from 'discord.js';
import { FeatureSingleton } from '../singleton/feature.singleton';
import { LoggerSingleton } from '../singleton/logger.singleton';
import { BotEvent } from '../types/bot-event.type';
import { Context } from '../utils/context.class';
import { UserUtil } from '../utils/user.util';

const logger: LoggerSingleton = LoggerSingleton.instance;
const context: Context = new Context('VOICE-STATE-UPDATE-EVENT');

const event: BotEvent = {
    name: Events.VoiceStateUpdate,
    once: false,
    async execute(_client: Client, _oldState: VoiceState, newState: VoiceState): Promise<void> {
        const feature: FeatureSingleton = FeatureSingleton.instance;
        if (feature.data.auto_disconnect && newState.channelId) {
            const targetUser: GuildMember = await UserUtil.getGuildMemberFromGuild(newState.guild, feature.data.auto_disconnect);
            logger.trace(context, `Disconnect user \`${targetUser.displayName}\` because auto-disconnect set for him`);
            await targetUser.voice.disconnect();
        }
    },
};

export default event;
