import { AggregatingProblemReporter, deserializeLanguagesFrom } from "@lionweb/core"
import { generateMermaidForLanguage, generatePlantUmlForLanguage, tryReadSerializationChunk } from "@lionweb/utilities"
import { writeFile } from "fs/promises"
import { dirname } from "path"

export const diagramFromSerializationChunkAt = async (path: string) => {
    const jsonOrError = await tryReadSerializationChunk(path)
    if (jsonOrError instanceof Error) {
        console.error(`"${path}" does not point to a valid JSON serialization of a language: ${jsonOrError.message}`)
        return
    }

    const dir = dirname(path)
    const problemReporter = new AggregatingProblemReporter()
    const languages = deserializeLanguagesFrom({ serializationChunk: jsonOrError, problemReporter})
    problemReporter.reportAllProblemsOnConsole()
    await Promise.all(
        languages.flatMap((language) => [
            writeFile(`${dir}/${language.name}.puml`, generatePlantUmlForLanguage(language)),
            writeFile(`${dir}/${language.name}.md`, generateMermaidForLanguage(language))
        ])
    )
    console.log(`generated diagrams: "${path}" -> "${dir}/"`)
}

