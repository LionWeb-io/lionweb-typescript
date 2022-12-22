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


export type Sha256IdGenOptions = {
    salt?: string
    doNotCheckForUniqueness?: boolean
}

export const sha256IdGen = (options?: Sha256IdGenOptions): IdGenerator => {
    const salt = options === undefined || options.salt
    const doNotCheckForUniqueness = options === undefined || !!options.doNotCheckForUniqueness
    const datas: string[] = []
    return (data?: string) => {
        if (data === undefined) {
            throw new Error(`expected data for hashing`)
        }
        if (!doNotCheckForUniqueness) {
            if (datas.indexOf(data) > -1) {
                throw new Error(`duplicate data encountered: "${data}"`)
            }
            datas.push(data)
        }
        return createHash("sha256")
            .update((salt === undefined ? "" : salt) + data)
            .digest("base64url")
            .toString()
    }
}

