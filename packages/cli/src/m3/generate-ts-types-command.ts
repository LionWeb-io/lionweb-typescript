import { extname, join } from "path"
import { existsSync, mkdirSync, statSync, writeFileSync } from "fs"

import { AggregatingSimplisticHandler, deserializeLanguagesWithHandler } from "@lionweb/core"
import { GenerationOptions, readSerializationChunk, tsTypeDefsForLanguage } from "@lionweb/utilities"

const generateTsTypesFromSerialization = async (path: string, generationOptions: GenerationOptions[]) => {
    try {
        const genPath = path.substring(0, path.length - extname(path).length) + "_gen"
        if (!(existsSync(genPath) && statSync(genPath).isDirectory())) {
            mkdirSync(genPath)
        }

        const handler = new AggregatingSimplisticHandler()
        const languages = deserializeLanguagesWithHandler(await readSerializationChunk(path), handler)
        handler.reportAllProblemsOnConsole()

        languages.forEach((language) => {
            const fileName = `${language.name}.g.ts`
            writeFileSync(join(genPath, fileName), tsTypeDefsForLanguage(language, ...generationOptions))
            console.log(`generated ${language.name}.g.ts for language "${language.name}"`)
        })

        console.log(`generated TS types: "${path}" -> "${genPath}"`)

        if (languages.length > 1) {
            const linesIndexTs = [
                languages.map((language) => `export * as ${language.name.replaceAll(".", "_")} from "./${language.name}.g.js"`)
            ]
            writeFileSync(join(genPath, "index.g.ts"), linesIndexTs.join(`\n`) + `\n`)
            console.log("generated index.g.ts")
        }
    } catch (e) {
        console.error(`"${path}" does not point to a valid JSON serialization of a language`)
        throw e
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
