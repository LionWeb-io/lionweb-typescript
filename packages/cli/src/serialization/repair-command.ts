import { writeJsonAsFileSync } from "@lionweb/node-utils"
import { orderedSerializationChunk, readSerializationChunk } from "@lionweb/utilities"

export const repairSerializationChunkAt = async (path: string) => {
    const chunk = await readSerializationChunk(path)
    writeJsonAsFileSync(path, orderedSerializationChunk(chunk))
    console.log(`ordered(/"repaired"): ${path}`)
}
