export type FlatMapper<T, R> = (t: T) => R[]
export const flatmapNonCyclingFollowing = <T, R>(mapper: FlatMapper<T, R>, nexts: (t: T) => T[]): FlatMapper<T, R> =>
    (start: T): R[] => {
        const visited: T[] = []
        const rs: R[] = []
        const recurse = (t: T) => {
            if (visited.indexOf(t) > -1) {
                return
            }
            visited.push(t)
            rs.push(...mapper(t))
            nexts(t).forEach(recurse)
        }
        recurse(start)
        return rs
    }

