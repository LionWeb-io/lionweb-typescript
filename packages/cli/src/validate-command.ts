import { LanguageRegistry, validateFileResult } from "@lionweb/validation"

export const runValidationOnSerializationChunkAt = (path: string): void => {
    console.log(`Validating ${path}`)
    const validationResult = validateFileResult(path, false, new LanguageRegistry())
    console.log(validationResult.hasErrors() ? validationResult.issues.map(issue => issue.errorMsg()).join("\n") : "No errors found")
}
