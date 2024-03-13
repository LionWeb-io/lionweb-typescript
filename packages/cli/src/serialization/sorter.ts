import {extname} from "path"

import {readSerializationChunk, sortedSerializationChunk, writeJsonAsFile} from "@lionweb/utilities"


export const sortSerializationChunkAt = async (path: string) => {
    const chunk = await readSerializationChunk(path)
    const extLessPath = path.substring(0, path.length - extname(path).length)
    const sortedJson = sortedSerializationChunk(chunk)
    writeJsonAsFile(extLessPath + ".sorted.json", sortedJson)
    console.log(`sorted: "${path}" -> ${extLessPath}`)
}

