import { LionWebJsonChunk } from "../json/LionWebJson.js"
import { LionWebJsonChunkWrapper } from "../json/LionWebJsonChunkWrapper.js"
import { LanguageRegistry } from "../languages/index.js"
import { LionWebLanguageReferenceValidator } from "./LionWebLanguageReferenceValidator.js"
import { LionWebReferenceValidator } from "./LionWebReferenceValidator.js"
import { LionWebSyntaxValidator } from "./LionWebSyntaxValidator.js"
import { ValidationResult } from "./ValidationResult.js"

/**
 * Combined validator that calls all available validators.
 * Will stop when one validator fails.
 */
export class LionWebValidator {
    object: unknown

    chunk: unknown
    validationResult: ValidationResult
    syntaxValidator: LionWebSyntaxValidator
    referenceValidator: LionWebReferenceValidator
    syntaxCorrect: boolean = false
    referencesCorrect: boolean = false

    constructor(json: unknown, private registry: LanguageRegistry) {
        this.object = json
        this.validationResult = new ValidationResult()
        this.syntaxValidator = new LionWebSyntaxValidator(this.validationResult)
        this.referenceValidator = new LionWebReferenceValidator(this.validationResult)
    }

    validateAll() {
        this.validateSyntax()
        this.validateReferences()
        this.validateForLanguage()
    }

    validateSyntax() {
        this.syntaxValidator.recursive = true
        this.syntaxValidator.validate(this.object)
        this.syntaxCorrect = !this.validationResult.hasErrors()
        if (this.syntaxCorrect) {
            this.chunk = new LionWebJsonChunkWrapper(this.object as LionWebJsonChunk)
        }
    }

    validateReferences(): void {
        if (!this.syntaxCorrect) {
            // console.log("validateReferences not executed because there are syntax errors.")
            return
        }
        // when syntax is correct we know the chunk is actually a chunk!
        this.referenceValidator.validate(this.chunk as LionWebJsonChunkWrapper)
        this.referencesCorrect = !this.validationResult.hasErrors()
    }

    validateForLanguage(): void {
        if (!this.syntaxCorrect) {
            // console.log("validateForLanguage not executed because there are syntax errors.")
            return
        }
        if (!this.referencesCorrect) {
            // console.log("validateForLanguage not executed because there are reference errors.")
            return
        }
        const languageReferenceValidator = new LionWebLanguageReferenceValidator(this.validationResult, this.registry)
        // when syntax is correct we know the chunk is actually a chunk!
        languageReferenceValidator.validate(this.chunk as LionWebJsonChunkWrapper)
    }

    // setLanguage(json: LionwebLanguageDefinition) {
    //     this.language = json;
    // }
}
