import type { Client } from 'discord.js';
import { readdirSync } from 'fs';

module.exports = async (client: Client): Promise<void> => {
    const handlersDir: string = __dirname;

    readdirSync(handlersDir).forEach((handler: string): void => {
        if (!handler.endsWith('.ts') || handler.startsWith('handlers')) return;

        require(`${handlersDir}/${handler}`)(client);
    });
};
