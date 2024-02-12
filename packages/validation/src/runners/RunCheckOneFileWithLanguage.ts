import fs from "fs"
import { LanguageRegistry } from "../languages/index.js"
import { LionWebLanguageWrapper } from "../languages/LionWebLanguageWrapper.js"
import { LionWebValidator } from "../validators/LionWebValidator.js"
import { printIssues } from "./Utils.js"

const modelFile = process.argv[2]
const language = process.argv[3]

if (modelFile !== null) {
    const jsonString1 = fs.readFileSync(modelFile, "utf-8")
    const jsonModel = JSON.parse(jsonString1)
    const languageString = fs.readFileSync(language, "utf-8")
    const languageJson = JSON.parse(languageString)
    const m3String = fs.readFileSync("src/json/LionCore_M3.json", "utf-8")
    const m3Json = JSON.parse(m3String)
    const builtinString = fs.readFileSync("src/json/LionCore_builtins.json", "utf-8")
    const builtinJson = JSON.parse(builtinString)
    const registry = new LanguageRegistry()
    registry.addLanguage(new LionWebLanguageWrapper(m3Json))
    registry.addLanguage(new LionWebLanguageWrapper(builtinJson))
    registry.addLanguage(new LionWebLanguageWrapper(languageJson))

    const languageValidator = new LionWebValidator(languageJson, registry)

    languageValidator.validateSyntax()
    languageValidator.validateReferences()
    console.log("===== Language errors ======")
    printIssues(languageValidator.validationResult)

    const modelValidator = new LionWebValidator(jsonModel, registry)
    modelValidator.validateAll()
    console.log("===== Model errors ======")
    printIssues(modelValidator.validationResult)
}
