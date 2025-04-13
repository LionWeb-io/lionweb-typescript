import { deserializeLanguages, Language, lioncoreKey } from "@lionweb/core"
import { currentSerializationFormatVersion, LionWebJsonChunk, LionWebJsonUsedLanguage } from "@lionweb/json"
import { readFileAsJson } from "../utils/json.js"
import { picker } from "../utils/object.js"


/**
 * Reads the file at the given path as a {@link LionWebJsonChunk serialization chunk}.
 * **Note** that it's only checked that the file exists and can be parsed as JSON,
 * _not_ whether it satisfies the specified serialization chunk format!
 */
export const readSerializationChunk = async (path: string) => {
    try {
        return readFileAsJson(path) as LionWebJsonChunk
    } catch (e) {
        console.error(`${path} is not a valid JSON file`)
        throw e
    }
}
// TODO  don't throw, but return some kind of error object (– possibly using Promise.reject)


const isRecord = (json: unknown): json is Record<string, unknown> =>
    typeof json === "object" && !Array.isArray(json)

/**
 * @return whether the given JSON looks like the serialization of languages.
 */
export const looksLikeSerializedLanguages = (json: unknown): boolean =>
    isRecord(json)
    && json["serializationFormatVersion"] === currentSerializationFormatVersion
    && "languages" in json
    && Array.isArray(json["languages"])
    && json["languages"].some((language) => isRecord(language) && language["key"] === lioncoreKey)


/**
 * Tries to read the given path as a JSON file containing the serialization of languages,
 * and attempts to deserialize the serialization chunk when it is.
 * If any of that fails, return an empty list.
 */
export const tryReadAsLanguages = async (path: string): Promise<Language[]> => {
    const serializationChunk = await readSerializationChunk(path)
    if (!looksLikeSerializedLanguages(serializationChunk)) {
        console.error(`${path} is not a valid JSON serialization chunk of LionCore languages`)
        return []
    }
    try {
        return deserializeLanguages(serializationChunk)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.error(`${path} is not a valid JSON serialization chunk of LionCore languages: ${e.message}`)
        return []
    }
}


const flatMapDistinct = <T>(tss: (T[])[], equalFunc: (l: T, r: T) => boolean) =>
    tss.reduce<T[]>(
        (acc, ts) =>
            [
                ...acc,
                ...(ts.filter((r) => !acc.some((l) => equalFunc(l, r))))
            ],
        []
    )

const areEqual = (left: LionWebJsonUsedLanguage, right: LionWebJsonUsedLanguage): boolean =>
    left.key === right.key && left.version === right.version


/**
 * @return the combination of the given {@link LionWebJsonChunk serialization chunks} into one.
 */
export const combinationOf = (serializationChunks: LionWebJsonChunk[]): LionWebJsonChunk =>
    ({
        serializationFormatVersion: currentSerializationFormatVersion,
        languages: flatMapDistinct(serializationChunks.map(picker("languages")), areEqual),
        nodes: serializationChunks.flatMap(picker("nodes"))
    })


/**
 * Tries to read all the given paths as JSON serialization chunks that are serializations of languages,
 * and attempts to combine those chunks into one chunk, and deserializes that.
 */
export const tryReadAllAsLanguages = async (paths: string[]): Promise<Language[]> => {
    const serializationChunks =
        (await Promise.all(paths.map(readSerializationChunk)))
        .filter((serializationChunk, index) => {
            const ok = looksLikeSerializedLanguages(serializationChunk)
            if (!ok) {
                const path = paths[index]
                console.error(`${path} is not a valid JSON serialization chunk of LionCore languages`)
            }
            return ok
        })
    try {
        return deserializeLanguages(combinationOf(serializationChunks))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.error(`couldn't deserialize combined JSON serialization chunk of LionCore languages: ${e.message}`)
        return []
    }
}

