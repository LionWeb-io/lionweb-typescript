import {extname} from "path"
import {writeFileSync} from "fs"

import {GenerationOptions, readFileAsJson, tsTypesForLanguage} from "@lionweb/utilities"
import {deserializeLanguage, SerializationChunk} from "@lionweb/core"


const generateTsTypesFromSerialization = async (path: string, generationOptions: GenerationOptions[]) => {
    try {
        const json = readFileAsJson(path) as SerializationChunk
        const extlessPath = path.substring(0, path.length - extname(path).length)
        const language = deserializeLanguage(json)
        const tsFilePath = extlessPath + "-types.ts"
        writeFileSync(tsFilePath, tsTypesForLanguage(language, ...generationOptions))
        console.log(`generated TS types: "${path}" -> "${tsFilePath}"`)
    } catch (_) {
        console.error(`"${path}" does not point to a valid JSON serialization of a language`)
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

