/** Normalized JSON with 4 spaces a as indent */
export const toJson = (obj: unknown): string => {
    return JSON.stringify(obj, null, 4);
}
