import {writeFileSync} from "fs"
import {extname} from "path"

import {deserializeLanguages} from "@lionweb/core"
import {
    isSerializedLanguages,
    languagesAsText,
    readChunk,
    shortenedSerializationChunk,
    sortedSerializationChunk,
    writeJsonAsFile
} from "@lionweb/utilities"


export const extractFromSerialization = async (path: string) => {
    const chunk = await readChunk(path)
    const extLessPath = path.substring(0, path.length - extname(path).length)
    const sortedJson = sortedSerializationChunk(chunk)
    writeJsonAsFile(extLessPath + ".sorted.json", sortedJson)
    writeJsonAsFile(extLessPath + ".shortened.json", shortenedSerializationChunk(chunk))   // (could also sort)
    if (isSerializedLanguages(chunk)) {
        writeFileSync(extLessPath + ".txt", languagesAsText(deserializeLanguages(chunk)))
    }
    console.log(`extracted: "${path}" -> ${extLessPath}`)
}

