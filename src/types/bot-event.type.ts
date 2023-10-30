export interface BotEvent {
  name: string;
  once?: boolean | false;
  execute: (...args: any) => Promise<void>;
}
