/**
 * Type def. of a generic "flatMap" function.
 */
export type ResultMapper<T, R> = (t: T) => R[]

/**
 * Returns a function that performs a "flatMap" on a graph that's specified as a start vertex. and a function that computes (outgoing) edges.
 * The "flatMap" is performed depth-first, and doesn't loop on cycles.
 * 
 * @param mapper The function that calculates the result values
 * @param nextVertices  The function that calculates the next edges to visit.
 * @returns A function that takes a starting vertex and resursively calculates the result values for each vertex visited.
 */
export const visitAndMap =
    <T, R>(mapper: ResultMapper<T, R>, nextVertices: (t: T) => T[]): ResultMapper<T, R> =>
    (startVertex: T): R[] => {
        const visited: T[] = []
        const rs: R[] = []
        const recurse = (t: T) => {
            if (visited.indexOf(t) > -1) {
                return
            }
            visited.push(t)
            rs.push(...mapper(t))
            nextVertices(t).forEach(recurse)
        }
        recurse(startVertex)
        return rs
    }

/** 
 * A mapper function that returns the node itself as result
 */
export const selfMapper = <T>(t: T) => [t]
