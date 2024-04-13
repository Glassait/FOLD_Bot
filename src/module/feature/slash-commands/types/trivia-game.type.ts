import type { ButtonInteraction } from 'discord.js';

export type PlayerAnswer = {
    /**
     * Time taken by the player to answer the trivia question.
     */
    responseTime: number;
    /**
     * Answer given by the player.
     */
    response: string;
    /**
     * Discord interaction used to submit the answer.
     */
    interaction: ButtonInteraction<'cached'>;
};
