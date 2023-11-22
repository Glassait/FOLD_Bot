export type WebSiteState = { liveUrl: string; lastUrl: string; name: string; selector: string };

export type NewsLetter = { channel: string; website: WebSiteState[] };

export type InventoryType = {
    newsLetter: NewsLetter;
};
