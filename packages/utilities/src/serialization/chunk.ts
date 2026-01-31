import {
    allLionWebVersions,
    defaultLionWebVersion,
    deserializeLanguages,
    Language,
    lioncoreKey,
    LionWebVersion
} from "@lionweb/core"
import { LionWebJsonChunk, LionWebJsonUsedLanguage } from "@lionweb/json"
import { readFileAsJson } from "../utils/json.js"


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
 * @param lionWebVersion The LionWeb version that the given JSON should adhere to.
 * If not given, then the chunk should adhere to any of the {@link LionWebVersions specified LionWeb versions}.
 */
export const looksLikeSerializedLanguages = (json: unknown, lionWebVersion?: LionWebVersion): boolean =>
    isRecord(json)
    && (
        (lionWebVersion === undefined ? allLionWebVersions : [lionWebVersion])
            .some((version) => json["serializationFormatVersion"] === version.serializationFormatVersion)
    )
    && "languages" in json
    && Array.isArray(json["languages"])
    && json["languages"].some((language) => isRecord(language) && language["key"] === lioncoreKey)


/**
 * Tries to read the given path as a JSON file containing the serialization of languages,
 * and attempts to deserialize the serialization chunk when it is.
 * If any of that fails, return an empty list.
 * @param lionWebVersion The LionWeb version that the given JSON should adhere to.
 * If not given, then the chunk should adhere to any of the {@link LionWebVersions specified LionWeb versions}.
 */
export const tryReadAsLanguages = async (path: string, lionWebVersion?: LionWebVersion): Promise<Language[]> => {
    const serializationChunk = await readSerializationChunk(path)
    if (!looksLikeSerializedLanguages(serializationChunk, lionWebVersion)) {
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
 * @param lionWebVersion The {@link LionWebVersion} to emit the combined serialization chunk with.
 * If none is given, the version of the *first* serialization chunk is used.
 * If no chunks are given, the {@link defaultLionWebVersion} is used.
 */
export const combinationOf = (serializationChunks: LionWebJsonChunk[], lionWebVersion?: LionWebVersion): LionWebJsonChunk =>
    ({
        serializationFormatVersion:
            lionWebVersion?.serializationFormatVersion
                ?? (serializationChunks.length > 0 ? serializationChunks[0] : defaultLionWebVersion).serializationFormatVersion,
        languages: flatMapDistinct(serializationChunks.map(({languages}) => languages), areEqual),
        nodes: serializationChunks.flatMap(({nodes}) => nodes)
    })


/**
 * Tries to read all the given paths as JSON serialization chunks that are serializations of languages,
 * and attempts to combine those chunks into one chunk, and deserializes that.
 * @param lionWebVersion The LionWeb version that the given JSON should adhere to.
 * If not given, then the chunk should adhere to any of the {@link LionWebVersions specified LionWeb versions}.
 */
export const tryReadAllAsLanguages = async (paths: string[], lionWebVersion?: LionWebVersion): Promise<Language[]> => {
    const serializationChunks =
        (await Promise.all(paths.map(readSerializationChunk)))
        .filter((serializationChunk, index) => {
            const ok = looksLikeSerializedLanguages(serializationChunk, lionWebVersion)
            if (!ok) {
                const path = paths[index]
                console.error(`${path} is not a valid JSON serialization chunk of LionCore languages`)
            }
            return ok
        })
    try {
        return deserializeLanguages(combinationOf(serializationChunks, lionWebVersion))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.error(`couldn't deserialize combined JSON serialization chunk of LionCore languages: ${e.message}`)
        return []
    }
}

