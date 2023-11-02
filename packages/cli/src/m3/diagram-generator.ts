import {writeFileSync} from "fs"
import {extname} from "path"

import {deserializeLanguages, SerializationChunk} from "@lionweb/core"
import {generateMermaidForLanguage, generatePlantUmlForLanguage, readFileAsJson} from "@lionweb/utilities"


export const diagramFromSerialization = async (path: string) => {
    try {
        const json = readFileAsJson(path) as SerializationChunk
        const extlessPath = path.substring(0, path.length - extname(path).length)
        const languages = deserializeLanguages(json)
        writeFileSync(extlessPath + ".puml", languages.map(generatePlantUmlForLanguage).join("\n\n"))
        writeFileSync(extlessPath + ".md", languages.map(generateMermaidForLanguage).join("\n\n"))
        console.log(`generated diagrams: "${path}" -> "${extlessPath}"`)
    } catch (_) {
        console.error(`"${path}" does not point to a valid JSON serialization of a language`)
    }
}

