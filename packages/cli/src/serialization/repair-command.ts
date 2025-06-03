import { orderedSerializationChunk, readSerializationChunk, writeJsonAsFile } from "@lionweb/utilities"

export const repairSerializationChunkAt = async (path: string) => {
    const chunk = await readSerializationChunk(path)
    writeJsonAsFile(path, orderedSerializationChunk(chunk))
    console.log(`ordered(/"repaired"): ${path}`)
}
