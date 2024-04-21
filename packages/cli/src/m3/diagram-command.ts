import {writeFileSync} from "fs"
import {dirname} from "path"

import {deserializeLanguages} from "@lionweb/core"
import {generateMermaidForLanguage, generatePlantUmlForLanguage, readSerializationChunk} from "@lionweb/utilities"


export const diagramFromSerializationChunkAt = async (path: string) => {
    try {
        const json = await readSerializationChunk(path)
        const dir = dirname(path)
        const languages = deserializeLanguages(json)
        languages.forEach((language) => {
            writeFileSync(`${dir}/${language.name}.puml`, generatePlantUmlForLanguage(language))
            writeFileSync(`${dir}/${language.name}.md`, generateMermaidForLanguage(language))

        })
        console.log(`generated diagrams: "${path}" -> "${dir}/"`)
    } catch (_) {
        console.error(`"${path}" does not point to a valid JSON serialization of a language`)
    }
}

