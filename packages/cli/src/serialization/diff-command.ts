import { readSerializationChunk, writeJsonAsFile } from "@lionweb/utilities"
import { LionWebJsonDiff } from "@lionweb/json-diff"

export const diffSerializationChunks = async (leftPath: string, rightPath: string, diffPath: string) => {
    const differ = new LionWebJsonDiff()
    differ.diffLwChunk(await readSerializationChunk(leftPath), await readSerializationChunk(rightPath))
    writeJsonAsFile(diffPath, differ.diffResult.changes)
}

// TODO  re-interpret diff of two languages in a LionCore/M3-specific way, i.e. in terms of domain-specific ∂s
