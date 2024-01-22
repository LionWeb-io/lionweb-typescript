import { validateFileResultWithLanguage } from '@lionweb/validation';


export function runValidation(file: string): void {
    console.log("---->> Validating " + file)
    // Perform the validation
    const validationResult = validateFileResultWithLanguage(file)

    // Handling the error
    if (validationResult.hasErrors()) {
        console.log(validationResult.issues.map(issue => issue.errorMsg()).join("\n"))
    } else {
        console.log("No errors found")
    }
}