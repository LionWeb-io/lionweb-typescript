/** Normalized JSON with 4 spaces as indent */
export const asPrettyJsonString = (obj: unknown): string => {
    return JSON.stringify(obj, null, 4);
}
/** Minimal JSON with no spaces as indent */
export const asMinimalJsonString  = (obj: unknown): string => {
    return JSON.stringify(obj, null, 0);
}
