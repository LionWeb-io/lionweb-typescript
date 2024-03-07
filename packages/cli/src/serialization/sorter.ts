import {extname} from "path"

import {readChunk, sortedSerializationChunk, writeJsonAsFile} from "@lionweb/utilities"


export const sortSerializationChunkAt = async (path: string) => {
    const chunk = await readChunk(path)
    const extLessPath = path.substring(0, path.length - extname(path).length)
    const sortedJson = sortedSerializationChunk(chunk)
    writeJsonAsFile(extLessPath + ".sorted.json", sortedJson)
    console.log(`sorted: "${path}" -> ${extLessPath}`)
}

