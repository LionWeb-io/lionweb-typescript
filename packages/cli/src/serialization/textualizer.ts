import {writeFile} from "fs/promises"
import {extname} from "path"
import {genericAsTreeText, isSerializedLanguages, readChunk} from "@lionweb/utilities"
import {deserializeLanguages, Language} from "@lionweb/core"


export const executeTextualizeCommand = async (args: string[]) => {
    const indexLanguageArg = args.findIndex((arg) => arg === "--language" || arg === "--languages")
    // TODO  see if we can load languages “in order”, i.e.: later-named languages can be dependent on earlier-named languages -- (this is a foldRight, really)
    const languages = (indexLanguageArg > -1)
        ? (await Promise.all(args.slice(indexLanguageArg + 1).map(tryLoadAsLanguages))).flat()
        : []
    const chunkPaths = args.slice(0, indexLanguageArg > -1 ? indexLanguageArg : undefined)
    chunkPaths.forEach((chunkPath) => {
        textualizeSerializationChunk(chunkPath, languages)
    })
}

/**
 * Check whether the given path exists, is a JSON file containing the serialization of languages,
 * and attempt to deserialize when it is. If any of that fails, return an empty list.
 */
const tryLoadAsLanguages = async (path: string): Promise<Language[]> => {
    const chunk = await readChunk(path)
    if (!isSerializedLanguages(chunk)) {
        console.error(`${path} is not a valid JSON serialization chunk of LionCore languages`)
        return []
    }
    try {
        return deserializeLanguages(chunk)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        console.error(`${path} is not a valid JSON serialization chunk of LionCore languages: ${e.message}`)
        return []
    }
}

const textualizeSerializationChunk = async (path: string, languages: Language[] = []) => {
    const chunk = await readChunk(path)
    const extLessPath = path.substring(0, path.length - extname(path).length)
    await writeFile(extLessPath + ".txt", genericAsTreeText(chunk, languages))
    console.log(`textualized: ${path}`)
}

