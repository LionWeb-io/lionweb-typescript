import {createHash, nanoid} from "./deps.ts"
import {IdGenerator} from "../src/index.ts"


/**
 * ID generator based on the {@link https://zelark.github.io/nano-id-cc/ `nanoid` NPM package}.
 */
export const nanoIdGen = (): IdGenerator =>
    () => nanoid()


const defaultHashAlgorithm = "SHA256"

/**
 * Type definition for objects that configure a
 * {@link hashingIdGen hashing ID generator}.
 */
export type HashingIdGenConfig = {
    algorithm?: typeof defaultHashAlgorithm | string
    salt?: string
    encoding?: "base64url" | "base64"
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
    const encoding = config?.encoding ?? "base64url"

    return (data) => {
        if (data === undefined) {
            throw new Error(`expected data for hashing`)
        }
        return createHash(algorithm)
            .update(salt + data)
            .digest(encoding)
            .toString()
    }
}

