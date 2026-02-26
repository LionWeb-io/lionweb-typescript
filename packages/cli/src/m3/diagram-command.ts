import { AggregatingProblemReporter, deserializeLanguagesFrom } from "@lionweb/core"
import { generateMermaidForLanguage, generatePlantUmlForLanguage, readSerializationChunk } from "@lionweb/utilities"
import { writeFileSync } from "fs"
import { dirname } from "path"

export const diagramFromSerializationChunkAt = async (path: string) => {
    try {
        const json = await readSerializationChunk(path)
        const dir = dirname(path)
        const problemReporter = new AggregatingProblemReporter()
        const languages = deserializeLanguagesFrom({ serializationChunk: json, problemReporter})
        problemReporter.reportAllProblemsOnConsole()
        languages.forEach(language => {
            writeFileSync(`${dir}/${language.name}.puml`, generatePlantUmlForLanguage(language))
            writeFileSync(`${dir}/${language.name}.md`, generateMermaidForLanguage(language))
        })
        console.log(`generated diagrams: "${path}" -> "${dir}/"`)
    } catch (_) {
        console.error(`"${path}" does not point to a valid JSON serialization of a language`)
    }
}
