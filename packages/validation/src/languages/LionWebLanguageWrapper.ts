import {
    LionWebJsonChunkWrapper,
    MetaPointers,
    NodeUtils
} from "../json/index.js"
import { LionWebJsonChunk, LionWebJsonNode } from "../json/LionWebJson.js"
import { visitAndMap } from "../util/graphs.js"
import { isAnnotation, isConcept, isContainment, isInterface, isProperty, isReference } from "./LanguageUtils.js"

interface LionWebLanguageWrapperInterface {
    superClassifiers: (classifier: LionWebJsonNode) => LionWebJsonNode[]
    allClassifiers: (classifier: LionWebJsonNode) => LionWebJsonNode[]
    propertyDefinitions: (classifier: LionWebJsonNode) => LionWebJsonNode[]
    allProperties: (classifier: LionWebJsonNode) => LionWebJsonNode[]
    referenceDefinitions: (classifier: LionWebJsonNode) => LionWebJsonNode[]
    allReferenceDefinitions: (classifier: LionWebJsonNode) => LionWebJsonNode[]
    containmentDefinitions: (classifier: LionWebJsonNode) => LionWebJsonNode[]
    allContainments: (classifier: LionWebJsonNode) => LionWebJsonNode[]
}

/**
 * Class encapsulating a chunk that represent a language.
 */
export class LionWebLanguageWrapper extends LionWebJsonChunkWrapper implements LionWebLanguageWrapperInterface {
    name: string
    version: string
    key: string
    
    constructor(chunk: LionWebJsonChunk) {
        super(chunk)
        const languageNode: LionWebJsonNode = this.findNodesOfClassifier(MetaPointers.Language)[0]
        const versionProp = NodeUtils.findProperty(languageNode, MetaPointers.LanguageVersion)
        const keyProp = NodeUtils.findProperty(languageNode, MetaPointers.IKeyedKey)
        const nameProp = NodeUtils.findProperty(languageNode, MetaPointers.INamedName)
        this.version = versionProp?.value || "unknown"
        this.key = keyProp?.value || "unknown"
        this.name = nameProp?.value || "unknown"
    }

    superClassifiers = (classifier: LionWebJsonNode): LionWebJsonNode[] => {
        const result: LionWebJsonNode[] = []

        if (isConcept(classifier)) {
            const extnds = NodeUtils.findReference(classifier, MetaPointers.ConceptExtends)
            const implments = NodeUtils.findReference(classifier, MetaPointers.ConceptImplements)
            result.push(...this.getReferredNodes(extnds))
            result.push(...this.getReferredNodes(implments))
        } else if (isAnnotation(classifier)) {
            const extnds = NodeUtils.findReference(classifier, MetaPointers.AnnotationExtends)
            const implments = NodeUtils.findReference(classifier, MetaPointers.AnnotationImplements)
            result.push(...this.getReferredNodes(extnds))
            result.push(...this.getReferredNodes(implments))
        } else if (isInterface(classifier)) {
            const extnds = NodeUtils.findReference(classifier, MetaPointers.InterfaceExtends)
            result.push(...this.getReferredNodes(extnds))
        } else {
            throw new Error(`concept type ${typeof classifier} not handled`)
        }
        return result
    }

    allClassifiers = (classifier: LionWebJsonNode): LionWebJsonNode[] => {
        return visitAndMap(this.superClassifiers, this.superClassifiers)(classifier)
    }

    propertyDefinitions = (classifier: LionWebJsonNode): LionWebJsonNode[] => {
        const features = NodeUtils.findContainment(classifier, MetaPointers.ClassifierFeatures)
        const properties = this.getChildrenAsNodes(features).filter(f => isProperty(f))
        return properties
    }

    allProperties = (classifier: LionWebJsonNode): LionWebJsonNode[] => {
        return visitAndMap(this.propertyDefinitions, this.superClassifiers)(classifier)
    }

    referenceDefinitions = (classifier: LionWebJsonNode): LionWebJsonNode[] => {
        const features = NodeUtils.findContainment(classifier, MetaPointers.ClassifierFeatures)
        const references = this.getChildrenAsNodes(features).filter(f => isReference(f))
        return references
    }

    allReferenceDefinitions = (classifier: LionWebJsonNode): LionWebJsonNode[] => {
        return visitAndMap(this.referenceDefinitions, this.superClassifiers)(classifier)
    }

    containmentDefinitions = (classifier: LionWebJsonNode): LionWebJsonNode[] => {
        const features = NodeUtils.findContainment(classifier, MetaPointers.ClassifierFeatures)
        const properties = this.getChildrenAsNodes(features).filter(f => isContainment(f))
        return properties
    }

    allContainments = (classifier: LionWebJsonNode): LionWebJsonNode[] => {
        return visitAndMap(this.containmentDefinitions, this.superClassifiers)(classifier)
    }
}
