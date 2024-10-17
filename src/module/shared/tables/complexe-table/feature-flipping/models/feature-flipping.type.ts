/**
 * Represents the name of a feature for feature flipping.
 */
export type FeatureFlippingName =
    | 'fold_recruitment'
    | 'scrap_website'
    | 'detected_clan'
    | (string & Record<string, never>);
