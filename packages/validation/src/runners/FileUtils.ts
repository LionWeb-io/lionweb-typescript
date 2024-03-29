import fs from "fs"
import { LanguageRegistry } from "../languages/index.js"
import { LionWebValidator } from "../validators/LionWebValidator.js"
import { ValidationResult } from "../validators/ValidationResult.js"
import { getFilesRecursive, printIssues } from "./Utils.js"

export function validateFile(file: string, registry: LanguageRegistry): void {
    const result = validateFileResult(file, false, registry)
    printIssues(result)
}

export function validateFileResult(file: string, validateAgainstLanguage: boolean, registry: LanguageRegistry): ValidationResult {
    if (file !== null) {
        const jsonString1 = fs.readFileSync(file, "utf-8")
        const json1 = JSON.parse(jsonString1)
        const validator = new LionWebValidator(json1, registry)

        validator.validateSyntax()
        validator.validateReferences()
        if (validateAgainstLanguage) {
            validator.validateForLanguage()
        }
        return validator.validationResult
    }
    return new ValidationResult()
}

export function validateFolder(folder: string, registry: LanguageRegistry): void {
    let totalErrors = 0
    let totalSucceed = 0
    let totalFailed = 0

    for (const f of getFilesRecursive(folder, [])) {
        const jsonString1 = fs.readFileSync(f, "utf-8")
        const json1 = JSON.parse(jsonString1)
        const validator = new LionWebValidator(json1, registry)

        try {
            validator.validateAll()

            if (!validator.validationResult.hasErrors()) {
                totalSucceed += 1
                console.log("V PASSED " + f)
                printIssues(validator.validationResult, f)
            } else {
                printIssues(validator.validationResult, f)
                totalFailed += 1
                totalErrors += validator.validationResult.issues.length
            }
        } catch (e: unknown) {
            console.log("EXCEPTION in file: " + f)
            console.log("EXCEPTION " + (e as Error)?.stack)
        }
    }

    console.log("Total without errors: " + totalSucceed)
    console.log("Total with errors: " + totalFailed)
    console.log("Total number of errors: " + totalErrors)
}
