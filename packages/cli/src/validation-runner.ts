import { validateFileResultWithLanguage } from '@lionweb/validation';


export function runValidation(args: string[]): void {
    // Extract the file path from the arguments
    const file = args[0]

    // Perform the validation
    const validationResult = validateFileResultWithLanguage(file)

    // Handling the error
    if (validationResult.hasErrors()) {
        console.log(validationResult.toString())
        process.exit(1)
    } else {
        console.log("No errors found")
    }
}