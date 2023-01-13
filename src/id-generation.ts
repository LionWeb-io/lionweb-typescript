import {nanoid} from "npm:nanoid@4.0.0"
import {
    createHash
} from "https://deno.land/std@0.168.0/node/internal/crypto/hash.ts"


type GenData = string | undefined

/**
 * Type definition for a function that generates a unique ID,
 * possibly ingesting some data.
 */
export type IdGenerator = (data: GenData) => string


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
export type HashingIdGenConfig = {
    algorithm?: typeof defaultHashAlgorithm | string
    salt?: string
}

/**
 * Creates a {@link IdGenerator hashing ID generator},
 * optionally using a {@link HashingIdGenConfig configuration object}.
 * The default is:
 *   - uses the *SHA256* hashing algorithm
 *   - without salt prefix string
 * Note that the created ID generator must be given data in the form of a string (`!== undefined`).
 */
export const hashingIdGen = (config?: HashingIdGenConfig): IdGenerator => {
    const algorithm = config?.algorithm ?? defaultHashAlgorithm
    const salt = config?.salt ?? ""

    return (data) => {
        if (data === undefined) {
            throw new Error(`expected data for hashing`)
        }
        return createHash(algorithm)
            .update(salt + data)
            .digest("base64url")
            .toString()
    }
}


/**
 * Augments the given {@link IdGenerator ID generator} to check
 * whether that returns unique IDs, throwing an error when not.
 */
export const checkUniqueId = (idGen: IdGenerator): IdGenerator => {
    const ids: string[] = []

    return (data) => {
        const id = idGen(data)
        if (ids.indexOf(id) > -1) {
            throw new Error(`duplicate ID generated: "${id}"`)
        }
        ids.push(id)
        return id
    }
}


/**
 * Augments the given {@link IdGenerator ID generator} to check
 * whether it's been given unique {@link GenData data},
 * throwing an error when not.
 */
export const checkUniqueData = (idGen: IdGenerator): IdGenerator => {
    const datas: GenData[] = []
    return (data) => {
        if (datas.indexOf(data) > -1) {
            throw new Error(`duplicate data encountered: "${data}"`)
        }
        datas.push(data)
        return idGen(data)
    }
}

