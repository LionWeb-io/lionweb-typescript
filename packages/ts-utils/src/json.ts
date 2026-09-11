const jsonNormalizer = (nSpacesPerIndentation: number) =>
    (obj: unknown) =>
        JSON.stringify(obj, null, nSpacesPerIndentation)

/**
 * @return normalized JSON with – by default – 4 spaces as indentation.
 * Passing 0 for the `nSpacesPerIndentation` argument means: no whitespace at all — which is arguably “not pretty” at all.
 */
export const asPrettyJsonString = (obj: unknown, nSpacesPerIndentation: number = 4): string =>
    jsonNormalizer(nSpacesPerIndentation)(obj)

/**
 * @return minimal JSON with no whitespace at all.
 */
export const asMinimalJsonString  = jsonNormalizer(0)

