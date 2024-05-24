/**
 * @return a picker that picks the indicated key from instances of the indicated type.
 */
export const picker = <T, K extends keyof T>(key: K): (t: T) => T[K] =>
    (t: T) => t[key]

