import {writeFileSync} from "fs"

import {Language, lioncore, lioncoreBuiltins, serializeLanguage, serializeNodes} from "@lionweb/core"
import {libraryLanguage} from "@lionweb/test/dist/languages/library.js"
import {multiLanguage} from "@lionweb/test/dist/languages/multi.js"
import {languageWithEnum} from "@lionweb/test/dist/languages/with-enum.js"
import {libraryModel, libraryReadModelAPI} from "@lionweb/test/dist/instances/library.js"
import {multiModel, multiReadModelAPI} from "@lionweb/test/dist/instances/multi.js"
import {generateMermaidForLanguage, generatePlantUmlForLanguage, schemaFor, writeJsonAsFile} from "@lionweb/utilities"
import {builtinsPath, diagramPath, instancePath, languagePath, lioncorePath} from "./paths.js"


writeJsonAsFile(builtinsPath, serializeLanguage(lioncoreBuiltins))
console.log(`serialized LionCore-builtins`)
writeJsonAsFile(lioncorePath, serializeLanguage(lioncore))
console.log(`serialized LionCore-M3`)

writeFileSync(diagramPath( "metametamodel-gen.puml"), generatePlantUmlForLanguage(lioncore))
writeFileSync(diagramPath("metametamodel-gen.md"), generateMermaidForLanguage(lioncore))
console.log(`generated diagrams for LionCore M3`)


writeJsonAsFile(languagePath("library.json"), serializeLanguage(libraryLanguage))
console.log(`serialized Library M2`)

writeFileSync(diagramPath("library-gen.puml"), generatePlantUmlForLanguage(libraryLanguage))
writeFileSync(diagramPath("library-gen.md"), generateMermaidForLanguage(libraryLanguage))
console.log(`generated diagrams for Library M2`)

writeJsonAsFile(instancePath("library.json"), serializeNodes(libraryModel, libraryReadModelAPI))
console.log(`serialized library M1`)


writeJsonAsFile(languagePath("with-enum.json"), serializeLanguage(languageWithEnum))


writeJsonAsFile(languagePath("multi.json"), serializeLanguage(multiLanguage))
console.log(`serialized multi-language M2`)

writeJsonAsFile(instancePath("multi.json"), serializeNodes(multiModel, multiReadModelAPI))
console.log(`serialized multi-language M1`)


const persistSchemaFor = (language: Language) => {
    const schema = schemaFor(language)
    const schemaName = language.name.toLowerCase()
    writeJsonAsFile(`schemas/${schemaName}.serialization.schema.json`, schema)
}

persistSchemaFor(lioncore)
persistSchemaFor(libraryLanguage)

