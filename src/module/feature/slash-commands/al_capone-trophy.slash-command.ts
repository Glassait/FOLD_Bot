import { SlashCommandMentionableOption } from '@discordjs/builders';
import { Canvas, Image, type SKRSContext2D } from '@napi-rs/canvas';
import {
    AttachmentBuilder,
    ChannelType,
    type ChatInputCommandInteraction,
    type GuildMember,
    SlashCommandChannelOption,
    type TextChannel,
} from 'discord.js';
import { UserUtil } from '../../shared/utils/user.util';
import { SlashCommandModel } from './model/slash-command.model';

module.exports = new SlashCommandModel(
    'al_capone-trophy',
    'Décerne le Al_capone trophée à un joueur',
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const Canvas = require('@napi-rs/canvas');

        const targetUser: GuildMember | undefined = await UserUtil.getGuildMemberFromInteraction(interaction, 'target', true);

        if (!targetUser) {
            return;
        }

        const channel = interaction.options.get('salon')?.channel as TextChannel;

        if (!channel) {
            return;
        }

        const canvas: Canvas = Canvas.createCanvas(612, 612);
        const context: SKRSContext2D = canvas.getContext('2d');

        const background: Image = await Canvas.loadImage('src/assets/img/trophy.jpg');
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        context.beginPath();
        context.arc(307, 198, 75, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
        const avatar = await Canvas.loadImage(targetUser.displayAvatarURL({ extension: 'jpg' }));
        context.drawImage(avatar, 231, 120, 150, 150);

        const attachment = new AttachmentBuilder(await canvas.encode('jpeg'), { name: 'Al_capone-trophée.jpg' });

        await interaction.deleteReply();
        await channel.send({
            content: `<@${targetUser.id}> Un beau trophée pour toi !`,
            files: [attachment],
        });
    },
    {
        option: [
            new SlashCommandMentionableOption().setName('target').setDescription('Le joueur reçevant le trophée').setRequired(true),
            new SlashCommandChannelOption()
                .setName('salon')
                .setDescription('Le salon a envoyer le trophée')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText),
        ],
    }
);
