import {orderedSerializationChunk, readChunk, writeJsonAsFile} from "@lionweb/utilities"


export const repairSerializationChunkAt = async (path: string) => {
    const chunk = await readChunk(path)
    writeJsonAsFile(path, orderedSerializationChunk(chunk))
    console.log(`ordered(/"repaired"): ${path}`)
}

