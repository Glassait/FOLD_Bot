import { SlashCommandMentionableOption } from '@discordjs/builders';
import { Canvas, Image, loadImage, type SKRSContext2D } from '@napi-rs/canvas';
import {
    AttachmentBuilder,
    ChannelType,
    type ChatInputCommandInteraction,
    type GuildMember,
    SlashCommandChannelOption,
    TextChannel,
} from 'discord.js';
import { getGuildMemberFromInteraction } from 'utils/user.util';
import { SlashCommandModel } from './models/slash-command.model';

module.exports = new SlashCommandModel(
    'al_capone-trophy',
    'Décerne le Al_capone trophée à un joueur',
    async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const targetUser: GuildMember | undefined = await getGuildMemberFromInteraction(interaction, 'target', true);

        if (!targetUser) {
            return;
        }

        const channel: TextChannel | undefined = interaction.options.get('salon')?.channel as TextChannel | undefined;

        if (!channel) {
            return;
        }

        const canvas: Canvas = new Canvas(612, 612);
        const context: SKRSContext2D = canvas.getContext('2d');

        const background: Image = await loadImage('src/assets/img/trophy.png');
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        context.beginPath();
        context.arc(304, 140, 50, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
        const avatar = await loadImage(targetUser.displayAvatarURL({ extension: 'jpg' }));
        context.drawImage(avatar, 245, 85, avatar.width*0.9, avatar.height*0.9);

        const attachment = new AttachmentBuilder(await canvas.encode('jpeg'), { name: 'capone-trophy.jpg' });

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
