import { isEqualMetaPointer, LionWebJsonContainment, LionWebJsonNode, LionWebJsonProperty, LionWebJsonReference } from "@lionweb/json"
import {
    JsonContext,
    LION_CORE_BUILTINS_INAMED_NAME,
    LIONWEB_BOOLEAN_TYPE, LIONWEB_INTEGER_TYPE, LIONWEB_JSON_TYPE, LIONWEB_STRING_TYPE,
    LionWebJsonChunkWrapper,
    M3_Keys,
    MetaPointers,
    NodeUtils
} from "@lionweb/json-utils"
import {
    Language_ContainmentMetaPointerNotInClass_Issue,
    Language_IncorrectPropertyMetaPointer_Issue,
    Language_PropertyMetaPointerNotInClass_Issue,
    Language_PropertyValue_Issue,
    Language_ReferenceMetaPointerNotInClass_Issue,
    Language_UnknownConcept_Issue
} from "../issues/index.js"
import {
    Language_IncorrectContainmentMetaPointer_Issue,
    Language_IncorrectReferenceMetaPointer_Issue,
    Language_UnknownContainment_Issue,
    Language_UnknownProperty_Issue,
    Language_UnknownReference_Issue
} from "../issues/LanguageIssues.js"
// import {
//     KnownLanguages, LanguageRegistry
// } from "../languages/LanguageRegistry.js"
import { LanguageRegistry } from "../languages/index.js"
import { ValidationResult } from "./generic/ValidationResult.js"
import { validateBoolean, validateInteger, validateJSON } from "./ValidationFunctions.js"


/**
 * Check against the language definition
 */
export class LionWebLanguageReferenceValidator {
    validationResult: ValidationResult

    constructor(validationResult: ValidationResult, private registry: LanguageRegistry) {
        this.validationResult = validationResult
    }

    // reset() {
    //     this.validationResult.reset();
    // }

    // TODO test reference and children implementation
    validate(obj: LionWebJsonChunkWrapper): void {
        obj.jsonChunk.nodes.forEach((node, nodeIndex) => {
            const nodeContext = new JsonContext(null, ["node", nodeIndex])
            const nodeConcept = this.registry.getNodeByMetaPointer(node.classifier)
            if (nodeConcept === undefined && nodeContext !== undefined) {
                this.validationResult.issue(new Language_UnknownConcept_Issue(nodeContext, node.classifier))
                return
            }
            node.properties.forEach((property, propIndex) => {
                this.validateProperty(node, nodeConcept, property, nodeContext.concat("properties", propIndex))
            })
            node.containments.forEach((containment, childIndex) => {
                this.validateContainment(node, nodeConcept, containment, nodeContext.concat("containments", childIndex))
            })
            node.references.forEach((reference, refIndex) => {
                this.validateReference(node, nodeConcept, reference, nodeContext.concat("references", refIndex))
            })
        })
    }

    private validateContainment(_node: LionWebJsonNode, nodeConcept: LionWebJsonNode | undefined, containment: LionWebJsonContainment, context: JsonContext) {
        const metaConcept = this.registry.getNodeByMetaPointer(containment.containment)
        if (metaConcept === null || metaConcept === undefined) {
            this.validationResult.issue(new Language_UnknownContainment_Issue(context, containment.containment))
            return
        }
        if (metaConcept.classifier.key !== M3_Keys.Containment) {
            this.validationResult.issue(new Language_IncorrectContainmentMetaPointer_Issue(context, containment.containment, metaConcept.classifier.key))
        }
        if (nodeConcept !== undefined) {
            const cons = this.registry.languages.allContainments(nodeConcept)
            if (!cons.includes(metaConcept)) {
                this.validationResult.issue(new Language_ContainmentMetaPointerNotInClass_Issue(context, containment.containment, nodeConcept))
                return
            }
        }
        // TODO check type of children
    }

    private validateReference(_node: LionWebJsonNode, nodeConcept: LionWebJsonNode | undefined, ref: LionWebJsonReference, context: JsonContext) {
        const referenceDefinition = this.registry.getNodeByMetaPointer(ref.reference)
        if (referenceDefinition === null || referenceDefinition === undefined) {
            this.validationResult.issue(new Language_UnknownReference_Issue(context, ref.reference))
            return
        }
        if (referenceDefinition.classifier.key !== M3_Keys.Reference) {
            this.validationResult.issue(new Language_IncorrectReferenceMetaPointer_Issue(context, ref.reference, referenceDefinition.classifier.key))
        }
        if (nodeConcept !== undefined) {
            const refs = this.registry.languages.allReferenceDefinitions(nodeConcept)
            if (!refs.includes(referenceDefinition)) {
                this.validationResult.issue(new Language_ReferenceMetaPointerNotInClass_Issue(context, ref.reference, nodeConcept))
                return
            }
        }

        // TODO Check type of reference (if possible)

        // TODO Check for duplicate targets?
        // No, already done without language check
        // If so, what to check because there can be either or both a `resolveInfo` and a `reference`
    }

    /**
     * Checks wwhether the value of `prop1` is correct in relation with its property definition in the referred language.
     * @param prop
     */
    validateProperty(_node: LionWebJsonNode, nodeConcept: LionWebJsonNode | undefined, prop: LionWebJsonProperty, context: JsonContext): void {
        if (prop.value === null) {
            return
        }
        const propertyDefinition = this.registry.getNodeByMetaPointer(prop.property)
        if ( propertyDefinition === undefined) {
            this.validationResult.issue(new Language_UnknownProperty_Issue(context, prop.property))
            return
        }
        if (propertyDefinition.classifier.key !== M3_Keys.Property) {
            this.validationResult.issue(new Language_IncorrectPropertyMetaPointer_Issue(context, prop.property, propertyDefinition.classifier.key))
            return
        }
        if (nodeConcept !== undefined) {
            const props = this.registry.languages.allProperties(nodeConcept)
            if (!props.includes(propertyDefinition)) {
                this.validationResult.issue(new Language_PropertyMetaPointerNotInClass_Issue(context, prop.property, nodeConcept))
                return
            }
        }
        
        const refType = NodeUtils.findReference(propertyDefinition, MetaPointers.PropertyType)
        // const refType = propertyDefinition.references.find(ref => isEqualMetaPointer(ref.reference, MetaPointers.PropertyType))
        const propertyName = propertyDefinition.properties.find(p => p.property.key === LION_CORE_BUILTINS_INAMED_NAME)?.value
        // console.log("Found type should be " + refType.targets[0].reference);
        if (propertyName !== null && propertyName !== undefined) {
            if (refType !== null && refType !== undefined) {
                const typeReferenceId = refType.targets[0].reference
                switch (typeReferenceId) {
                    case LIONWEB_BOOLEAN_TYPE:
                        validateBoolean(prop.value, this.validationResult, context)
                        break
                    case LIONWEB_INTEGER_TYPE:
                        validateInteger(prop.value, this.validationResult, context)
                        break
                    case LIONWEB_STRING_TYPE:
                        // Each string is correct and having another JSON type is already captured
                        break
                    case LIONWEB_JSON_TYPE:
                        validateJSON(prop.value, this.validationResult, context)
                        break
                    default: {
                        // Check for enumeration
                        // console.log("validateProperty: 0")
                        const propTypeReference = NodeUtils.findReference(propertyDefinition, MetaPointers.PropertyType)
                        if (propTypeReference === undefined) {
                            // console.log("validateProperty: 1")
                            break
                        }
                        const propType = propTypeReference.targets[0].reference === null ? undefined : this.registry.findNode(propTypeReference.targets[0].reference)
                        if (propType === undefined) {
                            // console.log("validateProperty: 1.4 for " + prop.value + " ==> " + propTypeReference.targets[0].reference)
                            break
                        }
                        let match = false
                        if (isEqualMetaPointer(propType.classifier, MetaPointers.Enumeration)) {
                            const literalsContainment = NodeUtils.findContainment(propType, MetaPointers.EnumerationLiterals)
                            if (literalsContainment === undefined) {
                                // console.log("validateProperty: 2")
                                break;
                            }
                            const literals = literalsContainment.children.map(child => this.registry.findNode(child))
                            match = literals.some(lit => {
                                if (lit === undefined) {
                                    // console.log("validateProperty: 3")
                                    return false
                                }
                                const litKeyProp = NodeUtils.findProperty(lit, MetaPointers.IKeyedKey)
                                if (litKeyProp === undefined) {
                                    // console.log("validateProperty: 4")
                                    return false
                                }
                                return prop.value === litKeyProp.value
                            })
                        }
                        if (!match) {
                            this.validationResult.issue(new Language_PropertyValue_Issue(context, prop.property.key, prop.value, propType.classifier.key))
                        }
                    }
                }
            } else {
                // TODO refType not found, but
            }
        }
    }
}
