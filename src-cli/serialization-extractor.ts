import {writeFileSync} from "fs"
import {extname} from "path"

import {
    asText,
    deserializeLanguage,
    lioncoreQName,
    SerializationChunk,
    serializationFormatVersion
} from "../src-pkg/index.js"
import {shortenedSerialization, sortedSerialization} from "../src-utils/serialization-utils.js"
import {readFileAsJson, writeJsonAsFile} from "../src-utils/json.js"


const isRecord = (json: unknown): json is Record<string, unknown> =>
    typeof json === "object" && !Array.isArray(json)

const isSerializedLanguage = (json: unknown): boolean =>
       isRecord(json)
    && json["serializationFormatVersion"] === serializationFormatVersion
    && "languages" in json
    && Array.isArray(json["languages"])
    && json["languages"].some((language) => isRecord(language) && language["key"] === lioncoreQName)


export const extractFromSerialization = async (path: string) => {
    try {
        const json = readFileAsJson(path) as SerializationChunk
        const extlessPath = path.substring(0, path.length - extname(path).length)
        const sortedJson = sortedSerialization(json)
        writeJsonAsFile(extlessPath + ".sorted.json", sortedJson)
        writeJsonAsFile(extlessPath + ".shortened.json", shortenedSerialization(json))   // (could also sort)
        if (isSerializedLanguage(json)) {
            writeFileSync(extlessPath + ".txt", asText(deserializeLanguage(json)))
        }
        console.log(`extracted: "${path}" -> "${extlessPath}"`)
    } catch (_) {
        console.error(`"${path}" is not a valid JSON file`)
    }
}

