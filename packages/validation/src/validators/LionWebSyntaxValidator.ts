import { ChunksDefinitions, DeltaTypesDefinitions } from "./definitions/index.js"
import { SyntaxDefinition } from "./generic/index.js"
import { SyntaxValidator } from "./generic/SyntaxValidator.js"
import { ValidationResult } from "./generic/ValidationResult.js"
import { validateId, validateKey, validateSerializationFormatVersion, validateVersion } from "./ValidationFunctions.js"

const schema = new SyntaxDefinition([], [ChunksDefinitions, DeltaTypesDefinitions] )
schema.addValidator("LionWebId", validateId ),
schema.addValidator("LionWebKey", validateKey ),
schema.addValidator("LionWebVersion",validateVersion),
schema.addValidator("LionWebSerializationFormatVersion", validateSerializationFormatVersion)
/*
 * LionWebSyntaxValidator can check whether objects are structurally LionWeb objects.
 */
export class LionWebSyntaxValidator extends SyntaxValidator {

    constructor(validationResult: ValidationResult) {
        super(validationResult, schema)
    }
}

