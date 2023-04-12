/**
 * Groups a list of items according to a computed key.
 */
export const groupBy = <T>(ts: T[], keyFunc: (t: T) => string): Record<string, T[]> => {
    const map: Record<string, T[]> = {}
    ts.forEach((t) => {
        const key = keyFunc(t)
        let list = map[key]
        if (list === undefined) {
            list = []
            map[key] = list
        }
        list.push(t)
    })
    return map
}


/**
 * Filters the values of a map/record according the given predicate.
 */
export const filterValues = <V>(map: Record<string, V>, predicate: (v: V) => boolean): Record<string, V> =>
    Object.fromEntries(
        Object.entries(map)
            .filter(([_, value]) => predicate(value))
    )


/**
 * Computes the given items whose computed keys are duplicates, as a map key &rarr; items.
 */
export const duplicatesAmong = <T>(ts: T[], keyFunc: (t: T) => string): Record<string, T[]> =>
    filterValues(groupBy(ts, keyFunc), (ts) => ts.length > 1)

