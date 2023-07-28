export type FlatMapper<T, R> = (t: T) => R[]

/**
 * Performs a "flatMap" on a graph that's specified as a start vertex and a function that computes (outgoing) edges.
 * The "flatMap" is performed depth-first, and doesn't loop on cycles.
 */
const flatMapNonCyclingFollowing = <T, R>(
    mapper: FlatMapper<T, R>,
    edges: (t: T) => T[]
): FlatMapper<T, R> =>
    (startVertex: T): R[] => {
        const visited: T[] = []
        const rs: R[] = []
        const recurse = (t: T) => {
            if (visited.indexOf(t) > -1) {
                return
            }
            visited.push(t)
            rs.push(...mapper(t))
            edges(t).forEach(recurse)
        }
        recurse(startVertex)
        return rs
    }


const trivialFlatMapper = <T>(t: T) => [t]


export {
    flatMapNonCyclingFollowing,
    trivialFlatMapper
}

