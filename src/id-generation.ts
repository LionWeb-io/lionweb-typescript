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


export const sha256IdGen = (): IdGenerator => {
    const datas: string[] = []
    return (data?: string) => {
        if (data === undefined) {
            throw new Error(`expected data for hashing`)
        }
        if (datas.indexOf(data) > -1) {
            throw new Error(`duplicate data encountered: "${data}"`)
        }
        datas.push(data)
        return createHash("sha256").update(data).digest("hex").toString()
    }
}

