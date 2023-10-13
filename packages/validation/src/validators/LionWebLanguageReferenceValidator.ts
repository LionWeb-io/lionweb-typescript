import {
    Language_IncorrectContainmentMetaPointer_Issue,
    Language_IncorrectPropertyMetaPointer_Issue, Language_IncorrectReferenceMetaPointer_Issue,
    Language_UnknownConcept_Issue,
    Language_UnknownContainment_Issue,
    Language_UnknownProperty_Issue,
    Language_UnknownReference_Issue
} from "../issues/LanguageIssues";
import { IssueContext } from "../issues/ValidationIssue";
import {
    LION_CORE_BUILTINS_INAMED_NAME,
    LIONWEB_BOOLEAN_TYPE,
    LIONWEB_INTEGER_TYPE,
    LIONWEB_JSON_TYPE,
    LIONWEB_STRING_TYPE, LionWebJsonChild,
    LionWebJsonProperty, LionWebJsonReference
} from "../json/LionWebJson";
import { LionWebJsonChunkWrapper } from "../json/LionWebJsonChunkWrapper";
import { LIONWEB_M3_CONCEPT_KEY, LIONWEB_M3_PROPERTY_KEY, LIONWEB_M3_PROPERTY_TYPE_KEY, LionwebLanguageDefinition } from "../json/LionwebLanguageDefinition";
import { SimpleFieldvalidator } from "./SimpleFieldvalidator";
import { ValidationResult } from "./ValidationResult";

/**
 * Check against the language definition
 */
export class LionWebLanguageReferenceValidator {
    validationResult: ValidationResult;
    language: LionwebLanguageDefinition;
    simpleFieldValidator: SimpleFieldvalidator;

    constructor(validationResult: ValidationResult, lang: LionwebLanguageDefinition) {
        this.validationResult = validationResult;
        this.language = lang;
        this.simpleFieldValidator = new SimpleFieldvalidator(this.validationResult);
    }

    // reset() {
    //     this.validationResult.reset();
    // }

    // TODO test reference and children implementation
    validate(obj: LionWebJsonChunkWrapper): void {
        if (this.language === undefined || this.language === null) {
            return;
        }
        obj.jsonChunk.nodes.forEach((node, nodeIndex) => {
            const nodeContext = `node[${nodeIndex}]`;
            const jsonConcept = this.language.getNodeByMetaPointer(node.classifier);
            if (jsonConcept === null || jsonConcept === undefined) {
                this.validationResult.issue(new Language_UnknownConcept_Issue(new IssueContext(nodeContext), node.classifier));
                return;
            }
            node.children.forEach((child, childIndex) => {
                this.validateContainment(child, `${nodeContext}.child[${childIndex}]`);
            });
            node.references.forEach((ref, refIndex) => {
                this.validateReference(ref, `${nodeContext}.child[${refIndex}]`);
            });
            node.properties.forEach((prop, propIndex) => {
                this.validateProperty(prop, `${nodeContext}.child[${propIndex}]`);
            });
        });
    }

    private validateContainment(child: LionWebJsonChild, context: string) {
        const type = this.language.getNodeByMetaPointer(child.containment);
        if (type === null || type === undefined) {
            this.validationResult.issue(new Language_UnknownContainment_Issue(new IssueContext(context), child.containment));
            return;
        }
        if (type.classifier.key !== LIONWEB_M3_CONCEPT_KEY) {
            this.validationResult.issue(new Language_IncorrectContainmentMetaPointer_Issue(new IssueContext(context), child.containment, type.classifier.key));
        }
        // TODO check type of children
    }

    private validateReference(ref: LionWebJsonReference, context: string) {
        const type = this.language.getNodeByMetaPointer(ref.reference);
        if (type === null || type === undefined) {
            this.validationResult.issue(new Language_UnknownReference_Issue(new IssueContext(context), ref.reference));
            return;
        }
        if (type.classifier.key !== LIONWEB_M3_CONCEPT_KEY) {
            this.validationResult.issue(new Language_IncorrectReferenceMetaPointer_Issue(new IssueContext(context), ref.reference, type.classifier.key));
        }
        // TODO Check type of reference (if possible)

        // TODO Check for duplicate targets?
        // If so, what to check because there can be either or both a `resolveInfo` and a `reference`
    }
    
    /**
     * Checks wwhether the value of `prop1` is correct in relation with its property definition in the referred language.
     * @param prop
     */
    validateProperty(prop: LionWebJsonProperty, context: string): void {
        if (prop.value === null) {
            return;
        }
        const type = this.language.getNodeByMetaPointer(prop.property);
        if (type === null || type === undefined) {
            this.validationResult.issue(new Language_UnknownProperty_Issue(new IssueContext(context), prop.property));
            return;
        }
        if (type.classifier.key !== LIONWEB_M3_PROPERTY_KEY) {
            this.validationResult.issue(new Language_IncorrectPropertyMetaPointer_Issue(new IssueContext(context), prop.property, type.classifier.key));
            return;
        }
        // TODO check for property to exist inside the concept in the language
        //      Need to find inherited and implemented properties as well: complex!

        const refType = type.references.find((ref) => (ref.reference.key === LIONWEB_M3_PROPERTY_TYPE_KEY));
        const propertyName = type.properties.find(p => p.property.key === LION_CORE_BUILTINS_INAMED_NAME)?.value;
        // console.log("Fount type should be " + refType.targets[0].reference);
        if (propertyName !== undefined) {
            if (refType !== null && refType !== undefined) {
                switch (refType.targets[0].reference) {
                    case LIONWEB_BOOLEAN_TYPE:
                        this.simpleFieldValidator.validateBoolean(prop, propertyName, `${context}`);
                        break;
                    case LIONWEB_INTEGER_TYPE:
                        this.simpleFieldValidator.validateInteger(prop, propertyName, `${context}`);
                        break;
                    case LIONWEB_STRING_TYPE:
                        break;
                    case LIONWEB_JSON_TYPE:
                        this.simpleFieldValidator.validateJSON(prop, propertyName, `${context}`);
                        break;
                }
            } else {
                // TODO refType not found, but 
            }
        }
    }
}
