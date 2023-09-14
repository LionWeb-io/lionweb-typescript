import {writeFileSync} from "fs"

import {Language, lioncore, lioncoreBuiltins, serializeLanguage, serializeNodes} from "../src-pkg/index.js"

import {libraryLanguage} from "../src-test/languages/library.js"
import {multiLanguage} from "../src-test/languages/multi.js"
import {languageWithEnum} from "../src-test/languages/with-enum.js"
import {libraryModel, libraryModelApi} from "../src-test/instances/library.js"
import {multiModel, multiModelApi} from "../src-test/instances/multi.js"

import {generatePlantUmlForLanguage} from "../src-utils/m3/diagrams/PlantUML-generator.js"
import {generateMermaidForLanguage} from "../src-utils/m3/diagrams/Mermaid-generator.js"
import {schemaFor} from "../src-utils/m3/schema-generator.js"
import {writeJsonAsFile} from "../src-utils/json.js"

import {builtinsPath, diagramPath, instancePath, languagePath, lioncorePath} from "./paths.js"


writeJsonAsFile(builtinsPath, serializeLanguage(lioncoreBuiltins))
console.log(`serialized LIonCore-builtins`)
writeJsonAsFile(lioncorePath, serializeLanguage(lioncore))
console.log(`serialized LIonCore-M3`)

writeFileSync(diagramPath( "metametamodel-gen.puml"), generatePlantUmlForLanguage(lioncore))
writeFileSync(diagramPath("metametamodel-gen.md"), generateMermaidForLanguage(lioncore))
console.log(`generated diagrams for LIonCore M3`)


writeJsonAsFile(languagePath("library.json"), serializeLanguage(libraryLanguage))
console.log(`serialized Library M2`)

writeFileSync(diagramPath("library-gen.puml"), generatePlantUmlForLanguage(libraryLanguage))
writeFileSync(diagramPath("library-gen.md"), generateMermaidForLanguage(libraryLanguage))
console.log(`generated diagrams for Library M2`)

writeJsonAsFile(instancePath("library.json"), serializeNodes(libraryModel, libraryModelApi))
console.log(`serialized library M1`)


writeJsonAsFile(languagePath("with-enum.json"), serializeLanguage(languageWithEnum))


writeJsonAsFile(languagePath("multi.json"), serializeLanguage(multiLanguage))
console.log(`serialized multi-language M2`)

writeJsonAsFile(instancePath("multi.json"), serializeNodes(multiModel, multiModelApi))
console.log(`serialized multi-language M1`)


const persistSchemaFor = (language: Language) => {
    const schema = schemaFor(language)
    const schemaName = language.name.toLowerCase()
    writeJsonAsFile(`schemas/${schemaName}.serialization.schema.json`, schema)
}

persistSchemaFor(lioncore)
persistSchemaFor(libraryLanguage)




