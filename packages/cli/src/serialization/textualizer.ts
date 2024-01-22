import {writeFile} from "fs/promises"
import {extname} from "path"
import {
    genericAsTreeText,
    languagesAsText,
    looksLikeSerializedLanguages,
    readChunk,
    tryLoadAllAsLanguages
} from "@lionweb/utilities"
import {deserializeLanguages, Language} from "@lionweb/core"


const languagesAsRegularFlag = "--languagesAsRegular"

export const executeTextualizeCommand = async (args: string[]) => {
    const languagesAsRegular = args.some((arg) => arg === languagesAsRegularFlag)
    const otherArgs = args.filter((arg) => arg !== languagesAsRegularFlag)
    const indexLanguageArg = otherArgs.findIndex((arg) => arg === "--language" || arg === "--languages")
    const languages = indexLanguageArg > -1
        ? await tryLoadAllAsLanguages(otherArgs.slice(indexLanguageArg + 1))
        : []
    const chunkPaths = otherArgs.slice(0, indexLanguageArg > -1 ? indexLanguageArg : undefined)
    chunkPaths.forEach((chunkPath) => {
        textualizeSerializationChunk(chunkPath, languagesAsRegular, languages)
    })
}


const textualizeSerializationChunk = async (path: string, languagesAsRegular: boolean, languages: Language[] = []) => {
    const chunk = await readChunk(path)
    const extLessPath = path.substring(0, path.length - extname(path).length)
    await writeFile(
        extLessPath + ".txt",
        looksLikeSerializedLanguages(chunk) && !languagesAsRegular
            ? languagesAsText(deserializeLanguages(chunk))
            : genericAsTreeText(chunk, languages)
    )
    console.log(`textualized: ${path}`)
}

