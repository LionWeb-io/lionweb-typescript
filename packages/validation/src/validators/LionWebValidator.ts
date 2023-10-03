import { LionWebJsonChunk } from "../json/LionWebJson";
import { LionWebJsonChunkWrapper } from "../json/LionWebJsonChunkWrapper";
import { LionwebLanguageDefinition } from "../json/LionwebLanguageDefinition";
import { LionWebLanguageReferenceValidator } from "./LionWebLanguageReferenceValidator";
import { LionWebReferenceValidator } from "./LionWebReferenceValidator";
import { LionWebSyntaxValidator } from "./LionWebSyntaxValidator";
import { ValidationResult } from "./ValidationResult";

/**
 * Combined validator that calls all available validators.
 * Will stop when one validator fails.
 */
export class LionWebValidator {
    object: unknown;
    language: LionwebLanguageDefinition | null = null;

    chunk: unknown;
    validationResult: ValidationResult;
    syntaxValidator: LionWebSyntaxValidator;
    referenceValidator: LionWebReferenceValidator;
    syntaxCorrect: boolean = false;
    referencesCorrect: boolean = false;

    constructor(json: unknown, lang: LionwebLanguageDefinition | null) {
        this.object = json;
        this.language =lang;
        this.validationResult = new ValidationResult();
        this.syntaxValidator = new LionWebSyntaxValidator(this.validationResult);
        this.referenceValidator = new LionWebReferenceValidator(this.validationResult);
    }

    validateAll() {
        this.validateSyntax();
        this.validateReferences();
        this.validateForLanguage();
    }

    validateSyntax() {
        this.syntaxValidator.recursive = true;
        this.syntaxValidator.validate(this.object);
        this.syntaxCorrect = !this.validationResult.hasErrors();
        if (this.syntaxCorrect) {
            this.chunk = new LionWebJsonChunkWrapper(this.object as LionWebJsonChunk);
        }
    }

    validateReferences(): void {
        if (!this.syntaxCorrect) {
            // console.log("validateReferences not executed because there are syntax errors.")
            return;
        }
        if (this.language !== null) {
            // when syntax is correct we know the chunk is actually a chunk!
            this.referenceValidator.validate(this.chunk as LionWebJsonChunkWrapper);
            this.referencesCorrect = !this.validationResult.hasErrors()
        }
    }

    validateForLanguage(): void {
        if (!this.syntaxCorrect) {
            // console.log("validateForLanguage not executed because there are syntax errors.")
            return;
        }
        if (!this.referencesCorrect) {
            // console.log("validateForLanguage not executed because there are reference errors.")
            return;
        }
        if (this.language !== null) {
            const languageReferenceValidator = new LionWebLanguageReferenceValidator(this.validationResult, this.language);
            // when syntax is correct we know the chunk is actually a chunk!
            languageReferenceValidator.validate(this.chunk as LionWebJsonChunkWrapper);
        }
    }

    // setLanguage(json: LionwebLanguageDefinition) {
    //     this.language = json;
    // }
}
