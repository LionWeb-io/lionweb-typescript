import {validateFileResultWithLanguage} from "@lionweb/validation"


export function runValidation(file: string): void {
    console.log(`Validating ${file}`)
    const validationResult = validateFileResultWithLanguage(file)
    console.log(
        validationResult.hasErrors()
            ? validationResult.issues.map(issue => issue.errorMsg()).join("\n")
            : "No errors found"
    )
}

