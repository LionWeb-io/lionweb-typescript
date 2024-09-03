import {extname, join} from "path"
import {existsSync, mkdirSync, statSync, writeFileSync} from "fs"

import {AggregatingSimplisticHandler, deserializeLanguagesWithHandler} from "@lionweb/core"
import {GenerationOptions, readSerializationChunk, tsTypesForLanguage} from "@lionweb/utilities"


const generateTsTypesFromSerialization = async (path: string, generationOptions: GenerationOptions[]) => {
    try {
        const genPath = path.substring(0, path.length - extname(path).length) + "_gen"
        if (!(existsSync(genPath) && statSync(genPath).isDirectory())) {
            mkdirSync(genPath)
        }
        const handler = new AggregatingSimplisticHandler()
        deserializeLanguagesWithHandler(await readSerializationChunk(path), handler)
            .forEach((language) => {
                writeFileSync(join(genPath, `${language.name}.ts`), tsTypesForLanguage(language, ...generationOptions))
            })
        handler.reportAllProblemsOnConsole()
        console.log(`generated TS types: "${path}" -> "${genPath}"`)
    } catch (e) {
        console.error(`"${path}" does not point to a valid JSON serialization of a language`)
        throw e
    }
}


export const generateTsTypesWith = async (args: string[]) => {
    const generationOptions = args
        .filter((arg) => arg.startsWith("--"))
        .map((option) => option.substring(2).trim())
        .filter((option) => option in GenerationOptions)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((option) => (GenerationOptions as any)[option])    // e.g. "assumeSealed" -> GenerationOptions.assumeSealed

    args
        .filter((arg) => !arg.startsWith("--"))
        .forEach((path) => generateTsTypesFromSerialization(path, generationOptions))
}

