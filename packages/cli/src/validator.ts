import { LanguageRegistry, validateFileResult } from "@lionweb/validation"


export function runValidation(file: string): void {
    console.log(`Validating ${file}`)
    const validationResult = validateFileResult(file, false, new LanguageRegistry())
    console.log(
        validationResult.hasErrors()
            ? validationResult.issues.map(issue => issue.errorMsg()).join("\n")
            : "No errors found"
    )
}

