import {writeFileSync} from "fs"

import {Language, lioncore, lioncoreBuiltins, serializeLanguage, serializeNodes} from "../src-pkg/index.js"
import {languageWithEnum} from "../src-test/m3/language-with-enum.js"
import {libraryLanguage} from "../src-test/m3/library-language.js"
import {libraryModel, libraryModelApi} from "../src-test/library.js"
import {generatePlantUmlForLanguage} from "../src-utils/m3/diagrams/PlantUML-generator.js"
import {generateMermaidForLanguage} from "../src-utils/m3/diagrams/Mermaid-generator.js"
import {schemaFor} from "../src-utils/m3/schema-generator.js"
import {writeJsonAsFile} from "../src-utils/json.js"
import {serializedLioncorePath} from "./paths.js"
import {multiModel, multiModelApi} from "../src-test/multi.js"
import {multiLanguage} from "../src-test/m3/multi-language.js"


writeJsonAsFile("models/meta/builtins.json", serializeLanguage(lioncoreBuiltins))
console.log(`serialized LIonCore-builtins`)
writeJsonAsFile(serializedLioncorePath, serializeLanguage(lioncore))
console.log(`serialized LIonCore-M3`)

writeFileSync("diagrams/metametamodel-gen.puml", generatePlantUmlForLanguage(lioncore))
writeFileSync("diagrams/metametamodel-gen.md", generateMermaidForLanguage(lioncore))
console.log(`generated diagrams for LIonCore M3`)


writeJsonAsFile("models/meta/library.json", serializeLanguage(libraryLanguage))
console.log(`serialized Library M2`)

writeFileSync("diagrams/library-gen.puml", generatePlantUmlForLanguage(libraryLanguage))
writeFileSync("diagrams/library-gen.md", generateMermaidForLanguage(libraryLanguage))
console.log(`generated diagrams for Library M2`)

writeJsonAsFile("models/instance/library.json", serializeNodes(libraryModel, libraryModelApi))
console.log(`serialized library M1`)


writeJsonAsFile("models/meta/language-with-enum.json", serializeLanguage(languageWithEnum))


writeJsonAsFile("models/meta/multi-language.json", serializeLanguage(multiLanguage))
console.log(`serialized multi-language M2`)

writeJsonAsFile("models/instance/multi.json", serializeNodes(multiModel, multiModelApi))
console.log(`serialized multi-language M1`)

writeJsonAsFile("models/meta/language-with-enum.json", serializeLanguage(languageWithEnum))


const persistSchemaFor = (language: Language) => {
    const schema = schemaFor(language)
    const schemaName = language.name.toLowerCase()
    writeJsonAsFile(`schemas/${schemaName}.serialization.schema.json`, schema)
}

persistSchemaFor(lioncore)
persistSchemaFor(libraryLanguage)


/*
 * TODO  for JSON Schema validation:

1. meta-validate generic serialization schema separately
2. meta-validate all generated serialization schemas
3. validate all serializations (persisted &rarr; separately; in-test &rarr; on-the-fly)

 */

