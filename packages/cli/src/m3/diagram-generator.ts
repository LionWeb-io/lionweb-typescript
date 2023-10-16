import {writeFileSync} from "fs"
import {extname} from "path"

import {deserializeLanguage, SerializationChunk} from "@lionweb/core"
import {generateMermaidForLanguage, generatePlantUmlForLanguage, readFileAsJson} from "@lionweb/utilities"


export const diagramFromSerialization = async (path: string) => {
    try {
        const json = readFileAsJson(path) as SerializationChunk
        const extlessPath = path.substring(0, path.length - extname(path).length)
        const language = deserializeLanguage(json)
        writeFileSync(extlessPath + ".puml", generatePlantUmlForLanguage(language))
        writeFileSync(extlessPath + ".md", generateMermaidForLanguage(language))
        console.log(`generated diagrams: "${path}" -> "${extlessPath}"`)
    } catch (_) {
        console.error(`"${path}" does not point to a valid JSON serialization of a language`)
    }
}

