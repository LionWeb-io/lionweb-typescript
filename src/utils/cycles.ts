export type NextsFunction<T> = (t: T) => T[]


/**
 * Compute whether there's a cycle of dependencies, starting with `thing` and computing "nexts" with the given `nextsFunction`.
 * @return An array with a cycle of "things", starting at the given `thing`.
 *  An array of length 0 means: the given `thing` is not part of any cycle.
 */
export const cycleWith = <T>(thing: T, nextsFunction: NextsFunction<T>): T[] => {

    const visit = (current: T, chain: T[]): T[] => {
        if (chain.indexOf(current) > -1) {
            // Add current to end, so we know what sub-array constitutes the actual cycle:
            return [ ...chain, current ]
        }
        const extendedChain = [ ...chain, current ]
        for (const dependency of nextsFunction(current)) {
            const recursion = visit(dependency, extendedChain)
            if (recursion.length > 0) {
                return recursion
            }
        }
        return []
    }

    const result = visit(thing, [])
    return result.length > 0 && result[result.length - 1] === thing
        ? result
        : []
}

