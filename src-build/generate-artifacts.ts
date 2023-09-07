import {Language, lioncore, lioncoreBuiltins, serializeLanguage, serializeNodes} from "../src-pkg/index.ts"
import {languageWithEnum} from "../src-test/m3/language-with-enum.ts"
import {libraryLanguage} from "../src-test/m3/library-language.ts"
import {libraryModel, libraryModelApi} from "../src-test/library.ts"
import {generatePlantUmlForLanguage} from "../src-utils/m3/diagrams/PlantUML-generator.ts"
import {generateMermaidForLanguage} from "../src-utils/m3/diagrams/Mermaid-generator.ts"
import {schemaFor} from "../src-utils/m3/schema-generator.ts"
import {writeJsonAsFile} from "../src-utils/json.ts"
import {serializedLioncorePath} from "./paths.ts"


await writeJsonAsFile("models/meta/builtins.json", serializeLanguage(lioncoreBuiltins))
console.log(`serialized LIonCore-builtins`)
await writeJsonAsFile(serializedLioncorePath, serializeLanguage(lioncore))
console.log(`serialized LIonCore-M3`)

await Deno.writeTextFileSync("diagrams/metametamodel-gen.puml", generatePlantUmlForLanguage(lioncore))
await Deno.writeTextFileSync("diagrams/metametamodel-gen.md", generateMermaidForLanguage(lioncore))
console.log(`generated diagrams for LIonCore M3`)


await writeJsonAsFile("models/meta/library.json", serializeLanguage(libraryLanguage))
console.log(`serialized Library M2`)

await Deno.writeTextFileSync("diagrams/library-gen.puml", generatePlantUmlForLanguage(libraryLanguage))
await Deno.writeTextFileSync("diagrams/library-gen.md", generateMermaidForLanguage(libraryLanguage))
console.log(`generated diagrams for Library M2`)

await writeJsonAsFile("models/instance/library.json", serializeNodes(libraryModel, libraryModelApi))
console.log(`serialized library M1`)


await writeJsonAsFile("models/meta/language-with-enum.json", serializeLanguage(languageWithEnum))

const persistSchemaFor = async (language: Language) => {
    const schema = schemaFor(language)
    const schemaName = language.name.toLowerCase()
    await writeJsonAsFile(`schemas/${schemaName}.serialization.schema.json`, schema)
}

await persistSchemaFor(lioncore)
await persistSchemaFor(libraryLanguage)

/*
 * TODO  for JSON Schema validation:

1. meta-validate generic serialization schema separately
2. meta-validate all generated serialization schemas
3. validate all serializations (persisted &rarr; separately; in-test &rarr; on-the-fly)

 */

