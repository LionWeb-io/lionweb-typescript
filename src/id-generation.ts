import {nanoid} from "npm:nanoid@4.0.0"
import {
    createHash
} from "https://deno.land/std@0.168.0/node/internal/crypto/hash.ts"


/**
 * Type definition for a function that generates a unique ID,
 * possibly ingesting some data.
 */
export type IdGenerator = (data?: string) => string


/**
 * ID generator based on the {@link https://zelark.github.io/nano-id-cc/ `nanoid` NPM package}.
 */
export const nanoIdGen = (): IdGenerator =>
    () => nanoid()


/**
 * ID generator that produces sequential IDs:
 * `"1"`, `"2"`, `"3"`, &hellip;
 */
export const sequentialIdGen = (): IdGenerator => {
    let num = 0
    return () => `${++num}`
}


const defaultHashAlgorithm = "SHA256"

/**
 * Type definition for objects that configure a
 * {@link hashingIdGen hashing ID generator}.
 */
export type IdGenConfig = {
    doNotCheckForUniqueData?: boolean
    algorithm?: typeof defaultHashAlgorithm | string
    salt?: string
    checkForUniqueHash?: boolean
}

/**
 * Creates a {@link IdGenerator hashing ID generator},
 * optionally using a {@link IdGenConfig configuration object}.
 * The default is:
 *   - uses the *SHA256* hashing algorithm
 *   - without salt prefix string
 *   - while checking whether the data to hash is unique
 *   - without checking whether the generated IDs are unique.
 * Note that the created ID generator must be given data in the form of a string (`!== undefined`).
 */
export const hashingIdGen = (config?: IdGenConfig): IdGenerator => {
    const checkForUniqueData = !(config?.doNotCheckForUniqueData)
    const algorithm = config?.algorithm ?? defaultHashAlgorithm
    const salt = config?.salt ?? ""
    const checkForUniqueHash = config?.checkForUniqueHash

    const datas: string[] = []
    const hashes: string[] = []

    return (data?: string) => {
        if (data === undefined) {
            throw new Error(`expected data for hashing`)
        }
        if (checkForUniqueData) {
            if (datas.indexOf(data) > -1) {
                throw new Error(`duplicate data encountered: "${data}"`)
            }
            datas.push(data)
        }
        const hash = createHash(algorithm)
            .update(salt + data)
            .digest("base64url")
            .toString()
        if (checkForUniqueHash) {
            if (hashes.indexOf(hash) > -1) {
                throw new Error(`duplicate hash generated: "${hash}"`)
            }
            hashes.push(hash)
        }
        return hash
    }
}

