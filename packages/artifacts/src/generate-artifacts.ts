import {writeFileSync} from "fs"

import {Language, lioncore, lioncoreBuiltins, serializeLanguages, serializeNodes} from "@lionweb/core"
import {
    generateMermaidForLanguage,
    generatePlantUmlForLanguage,
    GenerationOptions,
    languageAsText,
    tsTypesForLanguage,
    writeJsonAsFile
} from "@lionweb/utilities"
import {languageWithEnum, libraryLanguage, multiLanguage, shapesLanguage} from "@lionweb/test/languages"
import {libraryExtractionFacade, libraryModel, multiExtractionFacade, multiModel} from "@lionweb/test/instances"
import {diagramPath, instancePath, languagePath} from "./paths.js"


writeFileSync(diagramPath( "metametamodel-gen.puml"), generatePlantUmlForLanguage(lioncore))
writeFileSync(diagramPath("metametamodel-gen.md"), generateMermaidForLanguage(lioncore))
console.log(`generated diagrams for LionCore M3`)


const saveLanguageFiles = (language: Language, name: string, ...generationOptions: GenerationOptions[]) => {
    writeJsonAsFile(languagePath(`${name}.json`), serializeLanguages(language))
    writeFileSync(languagePath(`${name}.txt`), languageAsText(language))
    writeFileSync(languagePath(`${name}-types.ts.txt`), tsTypesForLanguage(language, ...generationOptions))
        // (Generate with a '.txt' file extension to avoid it getting picked up by the compiler.)
    console.log(`saved files for ${language.name} M2`)
}


saveLanguageFiles(lioncore, "lioncore")
saveLanguageFiles(lioncoreBuiltins, "builtins")


saveLanguageFiles(shapesLanguage, "shapes", GenerationOptions.assumeSealed)


saveLanguageFiles(libraryLanguage, "library")

writeFileSync(diagramPath("library-gen.puml"), generatePlantUmlForLanguage(libraryLanguage))
writeFileSync(diagramPath("library-gen.md"), generateMermaidForLanguage(libraryLanguage))
console.log(`generated diagrams for Library M2`)

writeJsonAsFile(instancePath("library.json"), serializeNodes(libraryModel, libraryExtractionFacade))
console.log(`serialized library M1`)


saveLanguageFiles(languageWithEnum, "with-enum")


saveLanguageFiles(multiLanguage, "multi")

writeJsonAsFile(instancePath("multi.json"), serializeNodes(multiModel, multiExtractionFacade))
console.log(`serialized multi-language M1`)

