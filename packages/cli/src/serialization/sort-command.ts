import { writeJsonAsFileSync } from "@lionweb/node-utils"
import { readSerializationChunk, sortedSerializationChunk } from "@lionweb/utilities"
import { extname } from "path"

export const sortSerializationChunkAt = async (path: string) => {
    const chunk = await readSerializationChunk(path)
    const extLessPath = path.substring(0, path.length - extname(path).length)
    const sortedJson = sortedSerializationChunk(chunk)
    writeJsonAsFileSync(extLessPath + ".sorted.json", sortedJson)
    console.log(`sorted: "${path}" -> ${extLessPath}`)
}
