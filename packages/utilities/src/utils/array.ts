/**
 * Sum the given array of numbers.
 */
export const sumNumbers = (nums: number[]): number =>
    nums.reduce((acc, cur) => acc + cur, 0)

/**
 * @return a view of the given array of items with duplicates removed.
 */
export const uniquesAmong = <T>(ts: T[]): T[] =>
    [...new Set(ts)]

