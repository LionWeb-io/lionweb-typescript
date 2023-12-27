import {currentSerializationFormatVersion, lioncoreKey, SerializationChunk} from "@lionweb/core"
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

export const isSerializedLanguages = (json: unknown): boolean =>
    isRecord(json)
    && json["serializationFormatVersion"] === currentSerializationFormatVersion
    && "languages" in json
    && Array.isArray(json["languages"])
    && json["languages"].some((language) => isRecord(language) && language["key"] === lioncoreKey)

