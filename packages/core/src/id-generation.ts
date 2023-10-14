export type GenData = string | undefined

/**
 * Type definition for a function that generates a unique ID,
 * possibly ingesting some data.
 */
export type IdGenerator = (data: GenData) => string


