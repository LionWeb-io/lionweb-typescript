import { GenericIssue } from "../issues/index.js"
import { MissingM3Language_Issue } from "../issues/LanguageIssues.js"
import { isEqualMetaPointer, LionWebJsonNode, MetaPointers } from "../json/index.js"
import { JsonContext } from "../json/JsonContext.js"
import { isLionWebM3Language, LionWebJsonChunk } from "../json/LionWebJson.js"
import { isLionWebM3Node, LanguageRegistry } from "../languages/index.js"
import { LionWebLanguageWrapper } from "../languages/LionWebLanguageWrapper.js"
import { ValidationResult } from "./ValidationResult.js"

/**
 * Validates whether a chunk is a valid language definition
 */
export class LionWebLanguageValidator {
    validationResult: ValidationResult
    // chunkWrapper: LionWebJsonChunkWrapper 
    languageWrapper: LionWebLanguageWrapper
    // availableLanguages: LionWebLanguageDefinition[] = []

    constructor(chunk: LionWebJsonChunk, validationResult: ValidationResult, private registry: LanguageRegistry) {
        this.validationResult = validationResult
        // this.chunkWrapper = new LionWebJsonChunkWrapper(chunk)
        this.languageWrapper = new LionWebLanguageWrapper(chunk)
    }

    /**
     * Check whether the `chunk` represents a (exactly one) Language.
     * Assumption is that `chunk` is already validated as a correct *LionWebJsonChunk*
     * @param chunk
     */
    validateLanguage() {
        // this.chunkWrapper = new LionWebJsonChunkWrapper(chunk)
        // this.languageWrapper = new LionWebLanguageWrapper(chunk)
        const usedM3Language = this.languageWrapper.jsonChunk.languages.find(lang => isLionWebM3Language(lang))
        if (usedM3Language === undefined) {
            this.validationResult.issue(new MissingM3Language_Issue(new JsonContext(null, ["languages"])))
        }

        const languageNodes = this.languageWrapper.findNodesOfClassifier(MetaPointers.Language)
        if (languageNodes.length !== 1) {
            // TODO Better error handling.
            this.validationResult.issue(new GenericIssue( new JsonContext(null, ["languages"]), `ExactlyOneLanguageExpected: found ${languageNodes.length} languages`))
        }
        this.languageWrapper.jsonChunk.nodes.forEach((node, index) => {
            if (!isLionWebM3Node(node)) {
                this.validationResult.issue(new GenericIssue(new JsonContext(null, ["nodes", index]), `Only expect LionWebM3 nodes: node ${node.id} with classifier "${JSON.stringify(node.classifier)}" is incorrect`))
            } else {
                this.validateNode(node)
            }
        })
    }

    validateConcept(node: LionWebJsonNode): void {
        node.properties.forEach(prop => {
            const properties = this.languageWrapper?.findNodesOfClassifier(MetaPointers.Property)
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
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validateProperties(node: LionWebJsonNode, classifier: LionWebJsonNode): void {
        // const classifierPropertyDefs = this.languageWrapper?.allPropertyDefinitions(classifier)
        // node.properties.forEach(actualProp => {
        //     const propDef = classifierPropertyDefs.find(pdef => {
        //         classifierPropertyDefs.
        //     }
        //     if (propClassifier === undefined) {
        //         this.validationResult.issue(
        //             new GenericIssue(new JsonContext(null, ["nodes", "properties"]), 
        //                 `Property ${actualProp.property.key} not found for classifier ${classifier.id}`)
        //         )
        //     }
        // })
    }
}
