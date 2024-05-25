export class UrlUtil {
    /**
     * URL for accessing Wot Life clan data.
     */
    private static readonly WOT_LIFE_CLAN: string = 'https://fr.wot-life.com/eu/clan';

    public static getWotLifeUrl(clanName: string, clanId: number): string {
        return `${this.WOT_LIFE_CLAN}/${clanName}-${clanId}`;
    }
}
