import { SyntaxValidator } from "./generic/SyntaxValidator.js"
import { ValidationResult } from "./generic/ValidationResult.js"
import { LionWebSchema } from "./LionWebChunkDefinitions.js"

/**
 * LionWebSyntaxValidator can check whether objects are structurally LionWeb objects.
 */
export class LionWebSyntaxValidator extends SyntaxValidator {

    constructor(validationResult: ValidationResult) {
        super(validationResult, LionWebSchema)
    }
}

