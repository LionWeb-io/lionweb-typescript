import {readChunk, writeJsonAsFile} from "@lionweb/utilities"
import {LionWebJsonDiff} from "@lionweb/validation"

export const diffSerializationChunks = async (leftPath: string, rightPath: string, diffPath: string) => {
    const differ = new LionWebJsonDiff()
    differ.diffLwChunk(await readChunk(leftPath), await readChunk(rightPath))
    writeJsonAsFile(diffPath, differ.diffResult.changes)
}

// TODO  re-interpret diff of two languages in a LionCore/M3-specific way, i.e. in terms of domain-specific ∂s

