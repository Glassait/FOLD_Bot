/**
 * Represents the name of a feature for feature flipping.
 */
export type FeatureFlippingName =
    | 'trivia'
    | 'trivia_month'
    | 'fold_recruitment'
    | 'scrap_website'
    | 'search_clan'
    | (string & Record<string, never>);
