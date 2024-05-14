import type { Client } from 'discord.js';
import { readdirSync } from 'fs';
import { TimeEnum } from '../../shared/enums/time.enum';
import { EnvUtil } from '../../shared/utils/env.util';

module.exports = async (client: Client): Promise<void> => {
    const handlersDir: string = __dirname;

    for (const handler of readdirSync(handlersDir)) {
        if (!(!handler.endsWith('.ts') || handler.startsWith('handlers'))) {
            require(`${handlersDir}/${handler}`)(client);

            if (!EnvUtil.isDev()) {
                await EnvUtil.sleep(TimeEnum.SECONDE * 10);
            }
        }
    }
};
