import {extensionOfPath} from "../deps.ts"
import {deserializeLanguage} from "../../src-pkg/index.ts"
import {generatePlantUmlForLanguage} from "../../src-utils/m3/diagrams/PlantUML-generator.ts"
import {generateMermaidForLanguage} from "../../src-utils/m3/diagrams/Mermaid-generator.ts"


export const diagramFromSerialization = async (path: string) => {
    try {
        const json = JSON.parse(await Deno.readTextFile(path))
        const extlessPath = path.substring(0, path.length - extensionOfPath(path).length)
        const language = deserializeLanguage(json)
        await Deno.writeTextFileSync(extlessPath + ".puml", generatePlantUmlForLanguage(language))
        await Deno.writeTextFileSync(extlessPath + ".md", generateMermaidForLanguage(language))
        console.log(`generated diagrams: "${path}" -> "${extlessPath}"`)
    } catch (_) {
        console.error(`"${path}" is not a valid JSON file`)
    }
}

