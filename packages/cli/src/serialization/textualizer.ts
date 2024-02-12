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
import {separate} from "../language-aware-args.js"


const languagesAsRegularFlag = "--languagesAsRegular"

export const executeTextualizeCommand = async (args: string[]) => {
    const languagesAsRegular = args.some((arg) => arg === languagesAsRegularFlag)
    const otherArgs = args.filter((arg) => arg !== languagesAsRegularFlag)
    const separatedArgs = separate(otherArgs)
    const languages = await tryLoadAllAsLanguages(separatedArgs[1])
    separatedArgs[0].forEach((chunkPath) => {
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

