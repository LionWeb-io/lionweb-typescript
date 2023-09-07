type GenData = string | undefined

/**
 * Type definition for a function that generates a unique ID,
 * possibly ingesting some data.
 */
export type IdGenerator = (data: GenData) => string



/**
 * ID generator that produces sequential IDs:
 * `"1"`, `"2"`, `"3"`, &hellip;
 */
export const sequentialIdGen = (): IdGenerator => {
    let num = 0
    return () => `${++num}`
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

