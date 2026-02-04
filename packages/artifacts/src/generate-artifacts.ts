import { Language, LionWebVersions, serializeLanguages, serializerWith } from "@lionweb/core"
import {
    generateMermaidForLanguage,
    generatePlantUmlForLanguage,
    languageAsText,
    writeJsonAsFile
} from "@lionweb/utilities"
import { writeFileSync } from "fs"

import { libraryModel, libraryReader } from "@lionweb/test/dist/instances/library.js"
import { multiModel, multiReader } from "@lionweb/test/dist/instances/multi.js"
import { libraryLanguage } from "@lionweb/test/dist/languages/library.js"
import { multiLanguage } from "@lionweb/test/dist/languages/multi.js"
import { languageWithEnum } from "@lionweb/test/dist/languages/with-enum.js"
import { diagramPath, instancePath, languagePath } from "./paths.js"


const lioncore = LionWebVersions.v2023_1.lioncoreFacade.language

writeFileSync(diagramPath("metametamodel-gen.puml"), generatePlantUmlForLanguage(lioncore))
writeFileSync(diagramPath("metametamodel-gen.md"), generateMermaidForLanguage(lioncore))
console.log(`generated diagrams for LionCore M3`)

const lioncoreBuiltins = LionWebVersions.v2023_1.builtinsFacade.language

writeFileSync(diagramPath("builtins.puml"), generatePlantUmlForLanguage(lioncoreBuiltins))
writeFileSync(diagramPath("builtins.md"), generateMermaidForLanguage(lioncoreBuiltins))
console.log(`generated diagrams for LionCore Built-ins`)

const saveLanguageFiles = (language: Language, name: string) => {
    writeJsonAsFile(languagePath(`${name}.json`), serializeLanguages(language))
    writeFileSync(languagePath(`${name}.txt`), languageAsText(language))
    // (Generate with a '.txt' file extension to avoid it getting picked up by the compiler.)
    console.log(`saved files for ${language.name} M2`)
}

saveLanguageFiles(lioncore, "lioncore")
saveLanguageFiles(lioncoreBuiltins, "builtins")

saveLanguageFiles(libraryLanguage, "library")

writeFileSync(diagramPath("library-gen.puml"), generatePlantUmlForLanguage(libraryLanguage))
writeFileSync(diagramPath("library-gen.md"), generateMermaidForLanguage(libraryLanguage))
console.log(`generated diagrams for Library M2`)

writeJsonAsFile(instancePath("library.json"), serializerWith({ reader: libraryReader })(libraryModel))
console.log(`serialized library M1`)

saveLanguageFiles(languageWithEnum, "with-enum")

saveLanguageFiles(multiLanguage, "multi")

writeJsonAsFile(instancePath("multi.json"), serializerWith({ reader: multiReader} )(multiModel))
console.log(`serialized multi-language M1`)

