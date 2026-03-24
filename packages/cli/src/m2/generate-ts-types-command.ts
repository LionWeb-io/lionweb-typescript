import { extname, join } from "path"
import { writeFile } from "fs/promises"

import { AggregatingProblemReporter, deserializeLanguagesFrom } from "@lionweb/core"
import {
    GenerationOptions,
    readSerializationChunk,
    tryReadSerializationChunk,
    tsTypeDefsForLanguage
} from "@lionweb/utilities"
import { ensurePathSync } from "../fs-utils.js"

const generateTsTypesFromSerialization = async (path: string, generationOptions: GenerationOptions[]) => {
    const genPath = path.substring(0, path.length - extname(path).length) + "_gen"
    ensurePathSync(genPath)

    const problemReporter = new AggregatingProblemReporter()
    const jsonOrError = await tryReadSerializationChunk(path)
    if (jsonOrError instanceof Error) {
        console.error(`"${path}" does not point to a valid JSON serialization of a language: ${jsonOrError.message}`)
        return
    }

    const languages = deserializeLanguagesFrom({ serializationChunk: await readSerializationChunk(path), problemReporter })
    problemReporter.reportAllProblemsOnConsole()

    await Promise.all(
        languages.map((language) => {
            const fileName = `${language.name}.g.ts`
            const promise = writeFile(join(genPath, fileName), tsTypeDefsForLanguage(language, ...generationOptions))
            console.log(`generated ${language.name}.g.ts for language "${language.name}"`)
            return promise
        })
    )

    console.log(`generated TS types: "${path}" -> "${genPath}"`)

    if (languages.length > 1) {
        const linesIndexTs = [
            languages.map((language) => `export * as ${language.name.replaceAll(".", "_")} from "./${language.name}.g.js"`)
        ]
        await writeFile(join(genPath, "index.g.ts"), linesIndexTs.join(`\n`) + `\n`)
        console.log("generated index.g.ts")
    }
}

export const generateTsTypesWith = async (args: string[]) => {
    const generationOptions = args
        .filter(arg => arg.startsWith("--"))
        .map(option => option.substring(2).trim())
        .filter(option => option in GenerationOptions)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(option => (GenerationOptions as any)[option]) // e.g. "assumeSealed" -> GenerationOptions.assumeSealed

    args.filter(arg => !arg.startsWith("--")).forEach(path => generateTsTypesFromSerialization(path, generationOptions))
}
