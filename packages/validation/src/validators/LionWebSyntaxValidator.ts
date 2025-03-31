import { expectedTypes } from "./LionWebChunkDefinitions.js"
import { SyntaxValidator } from "./generic/SyntaxValidator.js"
import { ValidationResult } from "./generic/ValidationResult.js"

/**
 * LionWebSyntaxValidator can check whether objects are structurally LionWeb objects.
 */
export class LionWebSyntaxValidator extends SyntaxValidator {

    constructor(validationResult: ValidationResult) {
        super(validationResult, expectedTypes)
    }
}

