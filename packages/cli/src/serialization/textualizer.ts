import {writeFile} from "fs/promises"
import {extname} from "path"
import {genericAsTreeText, readChunk, tryLoadAllAsLanguages} from "@lionweb/utilities"
import {Language} from "@lionweb/core"


export const executeTextualizeCommand = async (args: string[]) => {
    const indexLanguageArg = args.findIndex((arg) => arg === "--language" || arg === "--languages")
    const languages = indexLanguageArg > -1
        ? await tryLoadAllAsLanguages(args.slice(indexLanguageArg + 1))
        : []
    const chunkPaths = args.slice(0, indexLanguageArg > -1 ? indexLanguageArg : undefined)
    chunkPaths.forEach((chunkPath) => {
        textualizeSerializationChunk(chunkPath, languages)
    })
}


const textualizeSerializationChunk = async (path: string, languages: Language[] = []) => {
    const chunk = await readChunk(path)
    const extLessPath = path.substring(0, path.length - extname(path).length)
    await writeFile(extLessPath + ".txt", genericAsTreeText(chunk, languages))
    console.log(`textualized: ${path}`)
}

