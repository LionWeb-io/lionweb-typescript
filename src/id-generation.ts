import {nanoid} from "npm:nanoid@4.0.0"
import {
    createHash
} from "https://deno.land/std@0.168.0/node/internal/crypto/hash.ts"


export type IdGenerator = (data?: string) => string


export const nanoIdGen = (): IdGenerator =>
    () => nanoid()


export const sequentialIdGen = (): IdGenerator => {
    let num = 0
    return () => `${++num}`
}


const defaultHashAlgorithm = "SHA256"

export type IdGenOptions = {
    doNotCheckForUniqueData?: boolean
    algorithm?: typeof defaultHashAlgorithm | string
    salt?: string
    checkForUniqueHash?: boolean
}

export const hashingIdGen = (options?: IdGenOptions): IdGenerator => {
    const checkForUniqueData = !(options?.doNotCheckForUniqueData)
    const algorithm = options?.algorithm ?? defaultHashAlgorithm
    const salt = options?.salt ?? ""
    const checkForUniqueHash = options?.checkForUniqueHash

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

