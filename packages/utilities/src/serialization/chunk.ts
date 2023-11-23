import {SerializationChunk} from "@lionweb/core"
import {readFileAsJson} from "@lionweb/utilities"

export const readChunk = async (path: string) => {
    try {
        return readFileAsJson(path) as SerializationChunk
    } catch (e) {
        console.error(`"${path}" is not a valid JSON file`)
        throw e
    }
}

