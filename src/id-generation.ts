import {createHash, nanoid} from "./deps.ts"


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


/**
 * Augments the given {@link IdGenerator ID generator} by checking
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


/**
 * Augments the given {@link IdGenerator ID generator} by checking
 * whether it's been given defined ({@code !== undefined}) data,
 * throwing an error when not.
 */
export const checkDefinedData = (idGen: IdGenerator): IdGenerator =>
    (data) => {
        if (data === undefined) {
            throw new Error(`expected data`)
        }
        return idGen(data)
    }


/**
 * Augments the given {@link IdGenerator ID generator} by checking
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
 * Augments the given {@link IdGenerator ID generator} by checking
 * whether it returns valid IDs, meaning [Base64URL](https://www.base64url.com/).
 * (See also [Wikipedia](https://en.wikipedia.org/wiki/Base64#Variants_summary_table).)
 * If a generated ID is not valid, an error is thrown.
 */
export const checkValidId = (idGen: IdGenerator): IdGenerator =>
    (data) => {
        const id = idGen(data)
        if (!id.match(/^[A-Za-z0-9_-]+$/)) {
            throw new Error(`generated ID is not valid: ${id}`)
        }
        return id
    }


/**
 * Type definition for transformers of {@link IdGenerator ID generators}.
 */
export type IdGenTransformer = (idGen: IdGenerator) => IdGenerator

/**
 * Wraps the given ("initial") {@link IdGenerator ID generator}
 * with the given {@link IdGenTransformer ID generator transformers}.
 * In other words:
 *
 *      wrap(idGen, trafo1, trafo2, ..., trafoN) === trafoN(...trafo2(trafo1(idGen)))
 */
export const wrapIdGen = (idGen: IdGenerator, ...idGenTransformers: IdGenTransformer[]): IdGenerator =>
    idGenTransformers.reduce((acc, current) => current(acc), idGen)


/**
 * Wraps the given ("initial") {@link IdGenerator ID generator} with all
 * {@link IdGenTransformer ID generator checkers} defined above.
 */
export const checkAll = (idGen: IdGenerator): IdGenerator =>
    wrapIdGen(
        idGen,
        checkDefinedData,
        checkUniqueData,
        checkValidId,
        checkUniqueId
    )

