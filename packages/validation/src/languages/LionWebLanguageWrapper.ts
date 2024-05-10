import { LionWebId, LionWebJsonChunkWrapper, MetaPointers, NodeUtils } from "../json/index.js"
import { LionWebJsonChunk, LionWebJsonNode } from "../json/LionWebJson.js"
import { visitAndMap } from "../util/graphs.js"
import {
    isAnnotation, isClassifier,
    isConcept,
    isContainment,
    isEnumeration,
    isEnumerationLiteral,
    isInterface,
    isPrimitiveType,
    isProperty,
    isReference
} from "./LanguageUtils.js"
import { Chunk, UsedLanguage } from "./m1nodes/m1.js"
import {
    M3Annotation,
    M3Classifier,
    M3Concept,
    M3Containment,
    M3Enumeration,
    M3EnumerationLiteral,
    M3Interface,
    M3Language, M3Node, M3PrimitiveType,
    M3Property,
    M3Reference
} from "./m3classes/index.js"

interface LionWebLanguageWrapperInterface {
    superClassifiers: (classifier: LionWebJsonNode) => LionWebJsonNode[]
    allSuperClassifiers: (classifier: LionWebJsonNode) => LionWebJsonNode[]
    propertyDefinitions: (classifier: LionWebJsonNode) => LionWebJsonNode[]
    allPropertyDefinitions: (classifier: LionWebJsonNode) => LionWebJsonNode[]
    referenceDefinitions: (classifier: LionWebJsonNode) => LionWebJsonNode[]
    allReferenceDefinitions: (classifier: LionWebJsonNode) => LionWebJsonNode[]
    containmentDefinitions: (classifier: LionWebJsonNode) => LionWebJsonNode[]
    allContainmentDefinitions: (classifier: LionWebJsonNode) => LionWebJsonNode[]
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

    /**
     * Instantiate the in-memory metamodel for all languages defined in M3Language
     */
    createM3Languages(jsonChunk: LionWebJsonChunk): M3Language[] {
        const chunk = new Chunk(jsonChunk.serializationFormatVersion)
        chunk.usedLanguages.push(...jsonChunk.languages.map(l => new UsedLanguage(l.key, l.version)))
        // What to do with Chunk?
        // language.dependsOn should be filled with usedLanguages?
        // No, dependsOn should be fund by going through all metapointers
        
        const nodeMap: Map<LionWebId, M3Node> = new Map<LionWebId, M3Classifier>()

        const languageNodes: LionWebJsonNode[] = this.findNodesOfClassifier(MetaPointers.Language)

        const languages = languageNodes.map(languageNode => {
            const version = NodeUtils.findPropertyValue(languageNode, MetaPointers.LanguageVersion) ?? "unknown"
            const key = NodeUtils.findPropertyValue(languageNode, MetaPointers.IKeyedKey) ?? "unknown"
            const name = NodeUtils.findPropertyValue(languageNode, MetaPointers.INamedName) ?? "unknown"
            return new M3Language(languageNode.id, { name: name, version: version, key: key })
        })
        
        // Convert all nodes to instances of M3 classes
        jsonChunk.nodes.forEach(jsonNode => {
            const key = NodeUtils.findPropertyValue(jsonNode, MetaPointers.IKeyedKey) ?? "unknown"
            const name = NodeUtils.findPropertyValue(jsonNode, MetaPointers.INamedName) ?? "unknown"
            const owningLanguage = languages.find(l => l.key === jsonNode.classifier?.key && l.version === jsonNode.classifier?.version)
            let result: M3Classifier | undefined
            if (isConcept(jsonNode)) {
                const abstract = NodeUtils.findPropertyValue(jsonNode, MetaPointers.ConceptAbstract) ?? "unknown"
                result = new M3Concept(jsonNode.id, {
                    name: name,
                    key: key,
                    abstract: abstract === "true",
                    parent: owningLanguage
                })
                owningLanguage?.entities.push(result)
                nodeMap.set(jsonNode.id, result)
            } else if (isAnnotation(jsonNode)) {
                result = new M3Annotation(jsonNode.id, { name: name, key: key, parent: owningLanguage })
                owningLanguage?.entities.push(result)
                nodeMap.set(jsonNode.id, result)
            } else if (isInterface(jsonNode)) {
                result = new M3Interface(jsonNode.id, { name: name, key: key, parent: owningLanguage })
                owningLanguage?.entities.push(result)
                nodeMap.set(jsonNode.id, result)
            } else if (isProperty(jsonNode)) {
                const optional = NodeUtils.findPropertyValue(jsonNode, MetaPointers.FeatureOptional) === "true" ?? false
                const property = new M3Property(jsonNode.id, { name: name, key: key, optional: optional })
                nodeMap.set(jsonNode.id, property)
            } else if (isContainment(jsonNode)) {
                const optional = NodeUtils.findPropertyValue(jsonNode, MetaPointers.FeatureOptional) === "true" ?? false
                const multiple = NodeUtils.findPropertyValue(jsonNode, MetaPointers.LinkMultiple) === "true" ?? false
                const containment = new M3Containment(jsonNode.id, { name: name, key: key, optional: optional, multiple: multiple })
                nodeMap.set(jsonNode.id, containment)
            } else if (isReference(jsonNode)) {
                const optional = NodeUtils.findPropertyValue(jsonNode, MetaPointers.FeatureOptional) === "true" ?? false
                const multiple = NodeUtils.findPropertyValue(jsonNode, MetaPointers.LinkMultiple) === "true" ?? false
                const reference = new M3Reference(jsonNode.id, { name: name, key: key, optional: optional, multiple: multiple })
                nodeMap.set(jsonNode.id, reference)
            } else if (isEnumeration(jsonNode)) {
                const enumeration = new M3Enumeration(jsonNode.id, { name: name, key: key })
                nodeMap.set(jsonNode.id, enumeration)
            } else if (isEnumerationLiteral(jsonNode)) {
                const literal = new M3EnumerationLiteral(jsonNode.id, { name: name, key: key })
                nodeMap.set(jsonNode.id, literal)
            } else if (isPrimitiveType(jsonNode)) {
                const primitiveType = new M3PrimitiveType(jsonNode.id, { name: name, key: key })
                nodeMap.set(jsonNode.id, primitiveType)
            } else {
                throw new Error(`concept type ${typeof jsonNode} not handled`)
            }
        })
        // Now that we have them all instantiated, try to resolve all metapointers
        jsonChunk.nodes.forEach(jsonNode => {
            if (isClassifier(jsonNode)) {
                const classifier = nodeMap.get(jsonNode.id) as M3Classifier
                const features = NodeUtils.findContainment(jsonNode, MetaPointers.ClassifierFeatures)
                features?.children.forEach(childId => {
                    const childNode = nodeMap.get(childId)
                    if (childNode !== undefined) {
                        if (childNode instanceof M3Property) {
                            classifier.m3properties.push(childNode)
                        } else if (childNode instanceof M3Containment) {
                            classifier.m3containments.push(childNode)
                        } else if (childNode instanceof M3Reference) {
                            classifier.m3references.push(childNode)
                        }
                    }
                })
            }
        })
        return languages
    }

    /**
     * Returns all direct super concepts and implemented interfaces of `classifier`
     * @param classifier
     */
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

    /**
     * Returns all super concepts and implemented interfaces of `classifier` recursively.
     * @param classifier
     */
    allSuperClassifiers = (classifier: LionWebJsonNode): LionWebJsonNode[] => {
        return visitAndMap(this.superClassifiers, this.superClassifiers)(classifier)
    }

    /**
     * Returns all properties defined by `classifier`, **not** looking at super classifiers or implemented interfaces.
     * @param classifier
     */
    propertyDefinitions = (classifier: LionWebJsonNode): LionWebJsonNode[] => {
        const features = NodeUtils.findContainment(classifier, MetaPointers.ClassifierFeatures)
        const properties = this.getContainedNodes(features).filter(f => isProperty(f))
        return properties
    }

    /**
     * Returns all properties defined by `classifier`, **including** properties of super classifiers and implemented interfaces.
     * @param classifier
     */
    allPropertyDefinitions = (classifier: LionWebJsonNode): LionWebJsonNode[] => {
        return visitAndMap(this.propertyDefinitions, this.superClassifiers)(classifier)
    }

    /**
     * Returns all references defined by `classifier`, **not** looking at super classifiers or implemented interfaces.
     * @param classifier
     */
    referenceDefinitions = (classifier: LionWebJsonNode): LionWebJsonNode[] => {
        const features = NodeUtils.findContainment(classifier, MetaPointers.ClassifierFeatures)
        const references = this.getContainedNodes(features).filter(f => isReference(f))
        return references
    }

    /**
     * Returns all references defined by `classifier`, **including** references of super classifiers and implemented interfaces.
     * @param classifier
     */
    allReferenceDefinitions = (classifier: LionWebJsonNode): LionWebJsonNode[] => {
        return visitAndMap(this.referenceDefinitions, this.superClassifiers)(classifier)
    }

    /**
     * Returns all containments defined by `classifier`, **not** looking at super classifiers or implemented interfaces.
     * @param classifier
     */
    containmentDefinitions = (classifier: LionWebJsonNode): LionWebJsonNode[] => {
        const features = NodeUtils.findContainment(classifier, MetaPointers.ClassifierFeatures)
        const properties = this.getContainedNodes(features).filter(f => isContainment(f))
        return properties
    }

    /**
     * Returns all containments defined by `classifier`, **including** containments of super classifiers and implemented interfaces.
     * @param classifier
     */
    allContainmentDefinitions = (classifier: LionWebJsonNode): LionWebJsonNode[] => {
        return visitAndMap(this.containmentDefinitions, this.superClassifiers)(classifier)
    }
}
