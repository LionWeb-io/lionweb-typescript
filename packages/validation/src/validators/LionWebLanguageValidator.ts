import { GenericIssue } from "../issues/index.js"
import { MissingM3Language_Issue } from "../issues/LanguageIssues.js"
import { isEqualMetaPointer, LionWebJsonNode, MetaPointers } from "../json/index.js"
import { JsonContext } from "../json/JsonContext.js"
import { isLionWebM3Language, LionWebJsonChunk } from "../json/LionWebJson.js"
import { LionWebJsonChunkWrapper } from "../json/LionWebJsonChunkWrapper.js"
import { isConcept, LanguageRegistry } from "../languages/index.js"
import { ValidationResult } from "./ValidationResult.js"

/**
 * Validates whether a chunk is a valid language definition
 */
export class LionWebLanguageValidator {
    validationResult: ValidationResult
    chunkWrapper: LionWebJsonChunkWrapper | undefined
    // availableLanguages: LionWebLanguageDefinition[] = []

    constructor(validationResult: ValidationResult, private registry: LanguageRegistry) {
        this.validationResult = validationResult
        this.chunkWrapper = undefined
    }

    /**
     * Check whether the metamodel is a Language.
     * Assumption is that _chunk_ is already validated as a correct :LionWebJsonChunk
     * @param obj
     */
    validateLanguage(chunk: LionWebJsonChunk) {
        this.chunkWrapper = new LionWebJsonChunkWrapper(chunk)
        const usedM3Language = chunk.languages.find(lang => isLionWebM3Language(lang))
        if (usedM3Language === undefined) {
            this.validationResult.issue(new MissingM3Language_Issue(new JsonContext(null, ["languages"])))
        }

        const languageNodes = this.chunkWrapper.findNodesOfClassifier(MetaPointers.Language)
        if (languageNodes.length !== 1) {
            // TODO Better error handling.
            console.error("Error: xpected exactly one Language node, found " + languageNodes.length + " => " + JSON.stringify(languageNodes))
        }
        chunk.nodes.forEach((node, index) => {
            if (!isConcept(node)) {
                this.validationResult.issue(new GenericIssue(new JsonContext(null, ["nodes", index]), `node ${node.id} is not a concept`))
            } else {
                this.validateConcept(node)
            }
        })
    }

    validateConcept(node: LionWebJsonNode): void {
        node.properties.forEach(prop => {
            const properties = this.chunkWrapper?.findNodesOfClassifier(MetaPointers.Property)
            const matchedProperty = properties?.find(p => isEqualMetaPointer(p.classifier, prop.property))
            // DUMMY
            return matchedProperty !== undefined
        })
    }

    validateNode(node: LionWebJsonNode): void {
        const classifier = this.registry.getNodeByMetaPointer(node.classifier)
        if (classifier === undefined) {
            this.validationResult.issue(
                new GenericIssue(new JsonContext(null, ["nodes"]), `Classifier ${node.classifier.key} not found for node ${node.id}`)
            )
            return
        }
        this.validateProperties(node, classifier)
    }
    
    validateProperties(node: LionWebJsonNode, classifier: LionWebJsonNode): void {
        node.properties.forEach(actualProp => {
            const propClassifier = this.registry.getNodeByMetaPointer(actualProp.property)
            if (propClassifier === undefined) {
                this.validationResult.issue(
                    new GenericIssue(new JsonContext(null, ["nodes", "properties"]), 
                        `Property ${actualProp.property.key} not found for classifier ${classifier.id}`)
                )
            }
        })
    }
}
