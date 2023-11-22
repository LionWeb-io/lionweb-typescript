import {writeFileSync} from "fs"
import {extname} from "path"

import {currentSerializationFormatVersion, deserializeLanguages, lioncoreKey, SerializationChunk} from "@lionweb/core"
import {languagesAsText, readFileAsJson, shortenedSerialization, sortedSerialization, writeJsonAsFile} from "@lionweb/utilities"


const isRecord = (json: unknown): json is Record<string, unknown> =>
    typeof json === "object" && !Array.isArray(json)

const isSerializedLanguages = (json: unknown): boolean =>
       isRecord(json)
    && json["serializationFormatVersion"] === currentSerializationFormatVersion
    && "languages" in json
    && Array.isArray(json["languages"])
    && json["languages"].some((language) => isRecord(language) && language["key"] === lioncoreKey)


const readChunk = async (path: string) => {
    try {
        return readFileAsJson(path) as SerializationChunk
    } catch (e) {
        console.error(`"${path}" is not a valid JSON file`)
        throw e
    }
}

export const extractFromSerialization = async (path: string) => {
    const json = await readChunk(path)
    const extlessPath = path.substring(0, path.length - extname(path).length)
    const sortedJson = sortedSerialization(json)
    writeJsonAsFile(extlessPath + ".sorted.json", sortedJson)
    writeJsonAsFile(extlessPath + ".shortened.json", shortenedSerialization(json))   // (could also sort)
    if (isSerializedLanguages(json)) {
        writeFileSync(extlessPath + ".txt", languagesAsText(deserializeLanguages(json)))
    }
    console.log(`extracted: "${path}" -> "${extlessPath}"`)
}

