![GitHub repo file count (file extension)](https://img.shields.io/github/directory-file-count/Glassait/freePuntosBot/src%2Fmodule%2Ffeature%2Fevents?type=file&extension=ts&style=flat-square&label=Events)

# Events

In this folder you will find all the events of the bot.

##  Create new events

1. Create new typescript file in the folder with the patter 
    ```text
    name.event.ts
    ```
2. Use the following template
    ```typescript
    import { Client, Events, Interaction } from 'discord.js';
    import { BotEvent } from './types/bot-event.type';
   
    export const event: BotEvent = {
        name: undefined, // The name of the event, used Events
        once: undefined, // If the event is only executer once, this parameter is optional
        async execute(_client: Client, interaction: Interaction): Promise<void> {
            // Code to execute when event is raised
        },
    };
    ```
3. Fill the name with `Events`, once (optional) and execute part. More information in the [BotEvent type](./types/bot-event.type.ts)
4. Congrats the new events will be available. No more action are required to  register the event because it's automatic in the handler [event.handler.ts](../handlers/event.handler.ts)

## Log

If you want to add persistent log in to execute of the event, follow the following step.

1. Add the logger and the context to the file 
    ```typescript
    import { Logger } from '../../shared/classes/logger';
    import { Context } from '../../shared/classes/context';

    const logger: Logger = new Logger(new Context('NAME-EVENT'));
    ```
2. In the context give the name of the event
3. Call the level you want with the [logger](../../shared/classes/logger.ts), ex: 
   ```typescript
   logger.info("Message to the log");
   ```