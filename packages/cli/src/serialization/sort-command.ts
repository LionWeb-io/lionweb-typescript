import { writeJsonAsFileSync } from "@lionweb/node-utils"
import { readSerializationChunk, sortedSerializationChunk } from "@lionweb/utilities"
import { extname } from "path"


export const sortFlag = "--sort-connections"

export const executeSortCommand = async (args: string[]) => {
    const chunkPaths = args.filter((arg) => arg !== sortFlag)
    const sortConnections = chunkPaths.length < args.length
    await Promise.all(
        chunkPaths.map((chunkPath) => sortSerializationChunkAt(chunkPath, sortConnections))
    )
}

export const sortSerializationChunkAt = async (path: string, sortConnections: boolean) => {
    const chunk = await readSerializationChunk(path)
    const extLessPath = path.substring(0, path.length - extname(path).length)
    const sortedJson = sortedSerializationChunk(chunk, sortConnections)
    writeJsonAsFileSync(extLessPath + ".sorted.json", sortedJson)
    console.log(`sorted: "${path}" -> ${extLessPath}`)
}

