import type { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { TimeEnum } from '../../shared/enums/time.enum';
import { isDev, sleep } from '../../shared/utils/env.util';

module.exports = async (client: Client): Promise<void> => {
    const handlersDir: string = __dirname;

    for (const handler of readdirSync(handlersDir)) {
        if (!handler.endsWith('.ts') || handler.startsWith('handlers')) {
            continue;
        }

        require(`${handlersDir}/${handler}`)(client);

        if (!isDev()) {
            await sleep(TimeEnum.SECONDE * 10);
        }
    }
};
