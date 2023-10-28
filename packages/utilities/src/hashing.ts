import {nanoid} from "nanoid"
import {createHash} from "crypto"


/**
 * Type def. for a hashing function string &rarr; string.
 */
export type StringHasher = (str: string) => string


/**
 * Hasher based on the {@link https://zelark.github.io/nano-id-cc/ `nanoid` NPM package}.
 */
export const nanoIdGen = (): StringHasher =>
    () => nanoid()


const defaultHashAlgorithm = "SHA256"

/**
 * Type definition for objects that configure a
 * {@link StringHasher hasher}.
 */
export type StringHasherConfig = {
    algorithm?: typeof defaultHashAlgorithm | string
    salt?: string
    encoding?: "base64url" | "base64"
}

/**
 * Creates a {@link StringHasher hasher},
 * optionally using a {@link StringHasherConfig configuration object}.
 * The default is:
 *   - uses the *SHA256* hashing algorithm
 *   - without salt prefix string
 */
export const hasher = (config?: StringHasherConfig): StringHasher => {
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


/**
 * Augments the given {@link StringHasher hasher} by checking
 * whether it's been given unique strings,
 * throwing an error when not.
 */
export const checkUniqueData = (hasher: StringHasher): StringHasher => {
    const datas: string[] = []
    return (data) => {
        if (datas.indexOf(data) > -1) {
            throw new Error(`duplicate data encountered: "${data}"`)
        }
        datas.push(data)
        return hasher(data)
    }
}


/**
 * Augments the given {@link StringHasher hasher} by checking
 * whether it's been given defined ({@code !== undefined}) data,
 * throwing an error when not.
 */
export const checkDefinedData = (hasher: StringHasher): StringHasher =>
    (data) => {
        if (data === undefined) {
            throw new Error(`expected data`)
        }
        return hasher(data)
    }


/**
 * Augments the given {@link StringHasher hasher} by checking
 * whether that returns unique IDs, throwing an error when not.
 */
export const checkUniqueId = (hasher: StringHasher): StringHasher => {
    const ids: string[] = []

    return (data) => {
        const id = hasher(data)
        if (ids.indexOf(id) > -1) {
            throw new Error(`duplicate ID generated: "${id}"`)
        }
        ids.push(id)
        return id
    }
}


/**
 * Augments the given {@link StringHasher hasher} by checking
 * whether it returns valid IDs, meaning [Base64URL](https://www.base64url.com/).
 * (See also [Wikipedia](https://en.wikipedia.org/wiki/Base64#Variants_summary_table).)
 * If a generated ID is not valid, an error is thrown.
 */
export const checkValidId = (hasher: StringHasher): StringHasher =>
    (data) => {
        const id = hasher(data)
        if (!id.match(/^[A-Za-z0-9_-]+$/)) {
            throw new Error(`generated ID is not valid: ${id}`)
        }
        return id
    }


/**
 * Type definition for transformers of {@link StringHasher hashers}.
 */
export type StringHasherTransformer = (hasher: StringHasher) => StringHasher

/**
 * Wraps the given ("initial") {@link StringHasher hasher}
 * with the given {@link HasherTransformer hasher transfomers}.
 * In other words:
 *
 *      chain(hasher, trafo1, trafo2, ..., trafoN) === trafoN(...trafo2(trafo1(hasher)))
 */
export const chain = (hasher: StringHasher, ...hasherTransformers: StringHasherTransformer[]): StringHasher =>
    hasherTransformers.reduce((acc, current) => current(acc), hasher)


/**
 * Wraps the given ("initial") {@link StringHasher hasher} with all
 * {@link HasherTransformer hasher transfomers} defined above.
 */
export const checkAll = (hasher: StringHasher): StringHasher =>
    chain(
        hasher,
        checkDefinedData,
        checkUniqueData,
        checkValidId,
        checkUniqueId
    )

