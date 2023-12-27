import {
    currentSerializationFormatVersion,
    deserializeLanguages,
    Language,
    lioncoreKey,
    SerializationChunk
} from "@lionweb/core"
import {readFileAsJson} from "../json.js"


export const readChunk = async (path: string) => {
    try {
        return readFileAsJson(path) as SerializationChunk
    } catch (e) {
        console.error(`${path} is not a valid JSON file`)
        throw e
    }
}


const isRecord = (json: unknown): json is Record<string, unknown> =>
    typeof json === "object" && !Array.isArray(json)

export const looksLikeSerializedLanguages = (json: unknown): boolean =>
    isRecord(json)
    && json["serializationFormatVersion"] === currentSerializationFormatVersion
    && "languages" in json
    && Array.isArray(json["languages"])
    && json["languages"].some((language) => isRecord(language) && language["key"] === lioncoreKey)


/**
 * Check whether the given path exists, is a JSON file containing the serialization of languages,
 * and attempt to deserialize when it is. If any of that fails, return an empty list.
 */
export const tryLoadAsLanguages = async (path: string): Promise<Language[]> => {
    const chunk = await readChunk(path)
    if (!looksLikeSerializedLanguages(chunk)) {
        console.error(`${path} is not a valid JSON serialization chunk of LionCore languages`)
        return []
    }
    try {
        return deserializeLanguages(chunk)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.error(`${path} is not a valid JSON serialization chunk of LionCore languages: ${e.message}`)
        return []
    }
}


export const tryLoadAllAsLanguages = async (paths: string[]): Promise<Language[]> =>
    (await Promise.all(paths.map(tryLoadAsLanguages))).flat()
// TODO  load languages “in dependency order”, i.e.: later-named languages can be dependent on earlier-named languages -- (this is a foldRight, really)

