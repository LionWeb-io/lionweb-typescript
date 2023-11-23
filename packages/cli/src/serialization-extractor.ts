import {writeFileSync} from "fs"
import {extname} from "path"

import {currentSerializationFormatVersion, deserializeLanguages, lioncoreKey} from "@lionweb/core"
import {languagesAsText, readChunk, shortenedSerialization, sortedSerialization, writeJsonAsFile} from "@lionweb/utilities"


const isRecord = (json: unknown): json is Record<string, unknown> =>
    typeof json === "object" && !Array.isArray(json)

const isSerializedLanguages = (json: unknown): boolean =>
       isRecord(json)
    && json["serializationFormatVersion"] === currentSerializationFormatVersion
    && "languages" in json
    && Array.isArray(json["languages"])
    && json["languages"].some((language) => isRecord(language) && language["key"] === lioncoreKey)


export const extractFromSerialization = async (path: string) => {
    const chunk = await readChunk(path)
    const extLessPath = path.substring(0, path.length - extname(path).length)
    const sortedJson = sortedSerialization(chunk)
    writeJsonAsFile(extLessPath + ".sorted.json", sortedJson)
    writeJsonAsFile(extLessPath + ".shortened.json", shortenedSerialization(chunk))   // (could also sort)
    if (isSerializedLanguages(chunk)) {
        writeFileSync(extLessPath + ".txt", languagesAsText(deserializeLanguages(chunk)))
    }
    console.log(`extracted: "${path}" -> "${extLessPath}"`)
}

