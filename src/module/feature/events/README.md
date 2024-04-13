# Events ![GitHub repo file count (file extension)](https://img.shields.io/github/directory-file-count/Glassait/FOLD_Bot/src%2Fmodule%2Ffeature%2Fevents?type=file&extension=ts&style=flat-square&label=Events)

In this folder you will find all the events registered by the bot and there related code.

<details>
   <summary>Summary</summary>

-   [Create new event](#create-new-events)
-   [Log](#log)

</details>

## Create new event

1. Create new typescript file in the folder with the patter
    ```text
    name.event.ts
    ```
2. Use the following template

    ```typescript
    import { Client, Events, Interaction } from 'discord.js';
    import { BotEvent } from './types/bot-event.type';

    module.exports = {
        name: undefined,
        once: undefined,
        async execute(client: Client, interaction: Interaction): Promise<void> {},
    } as BotEvent;
    ```

3. Fill the part with (more information in the [BotEvent type](./types/bot-event.type.ts))
    - `name` - The name of the event, use `Events`,
    - `once` (optional) - If the event is only execute once
    - `execute` - Code to execute when event is raised.
4. Congrats the new events will be available. No more action are required to register the event because it's automatic in the handler [events.handler.ts](../handlers/events.handler.ts)

## Log

If you want to add persistent log in to execute of the event, follow the following step.

1. Add the logger and the context to the file

    ```typescript
    import { Logger } from '../../shared/classes/logger';
    import { basename } from 'node:path';

    const logger: Logger = new Logger(basename(__filename));
    ```

2. Call the level you want with the [logger](../../shared/classes/logger.ts), ex:
    ```typescript
    logger.info('Message to the log');
    ```

---
