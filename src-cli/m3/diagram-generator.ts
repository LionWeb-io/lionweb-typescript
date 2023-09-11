import {writeFileSync} from "fs"
import {extname} from "path"

import {deserializeLanguage, SerializationChunk} from "../../src-pkg/index.js"
import {generatePlantUmlForLanguage} from "../../src-utils/m3/diagrams/PlantUML-generator.js"
import {generateMermaidForLanguage} from "../../src-utils/m3/diagrams/Mermaid-generator.js"
import {readFileAsJson} from "../../src-utils/json.js"


export const diagramFromSerialization = async (path: string) => {
    try {
        const json = readFileAsJson(path) as SerializationChunk
        const extlessPath = path.substring(0, path.length - extname(path).length)
        const language = deserializeLanguage(json)
        writeFileSync(extlessPath + ".puml", generatePlantUmlForLanguage(language))
        writeFileSync(extlessPath + ".md", generateMermaidForLanguage(language))
        console.log(`generated diagrams: "${path}" -> "${extlessPath}"`)
    } catch (_) {
        console.error(`"${path}" is not a valid JSON file`)
    }
}

