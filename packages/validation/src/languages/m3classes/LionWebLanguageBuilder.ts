import { LionWebId, MetaPointers, NodeUtils } from "../../json/index.js"
import { LionWebJsonChunk } from "../../json/LionWebJson.js"
import {
    isAnnotation,
    isClassifier,
    isConcept,
    isContainment,
    isEnumeration,
    isEnumerationLiteral,
    isInterface,
    isLanguage,
    isLink,
    isPrimitiveType,
    isProperty,
    isReference
} from "../LanguageUtils.js"
import { Chunk, UsedLanguage } from "../m1nodes/m1.js"
import {
    M3Annotation,
    M3Classifier,
    M3Concept,
    M3Containment,
    M3Datatype,
    M3Enumeration,
    M3EnumerationLiteral,
    M3Interface,
    M3Language,
    M3LanguageEntity,
    M3Link,
    M3Node,
    M3PrimitiveType,
    M3Property,
    M3Reference
} from "./m3.js"

/**
 * Class encapsulating a chunk that represent a language.
 */
export class LionWebLanguageBuilder {
    /**
     * Instantiate the in-memory metamodel for all languages defined in M3Language
     */
    createM3Languages(jsonChunk: LionWebJsonChunk): M3Language[] {
        // console.log(JSON.stringify(jsonChunk, null, 2))
        const chunk = new Chunk(jsonChunk.serializationFormatVersion)
        chunk.usedLanguages.push(...jsonChunk.languages.map(l => new UsedLanguage(l.key, l.version)))
        // What to do with Chunk?
        // language.dependsOn should be filled with usedLanguages?
        // No, dependsOn should be found by going through all its metapointers and should be a subset of used languages

        const nodeMap: Map<LionWebId, M3Node> = new Map<LionWebId, M3Node>()

        const languages: M3Language[] = []

        // Convert all nodes to instances of M3 classes
        jsonChunk.nodes.forEach(jsonNode => {
            const key = NodeUtils.findPropertyValue(jsonNode, MetaPointers.IKeyedKey) ?? "unknown"
            const name = NodeUtils.findPropertyValue(jsonNode, MetaPointers.INamedName) ?? "unknown"
            let result: M3Classifier | undefined
            if (isConcept(jsonNode)) {
                const abstract = NodeUtils.findPropertyValue(jsonNode, MetaPointers.ConceptAbstract) ?? "unknown"
                result = new M3Concept(jsonNode.id, { name: name, key: key, abstract: abstract === "true" })
                nodeMap.set(jsonNode.id, result)
            } else if (isAnnotation(jsonNode)) {
                result = new M3Annotation(jsonNode.id, { name: name, key: key })
                nodeMap.set(jsonNode.id, result)
            } else if (isInterface(jsonNode)) {
                result = new M3Interface(jsonNode.id, { name: name, key: key })
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
                console.log("Adding Enumeration " + name)
            } else if (isEnumerationLiteral(jsonNode)) {
                const literal = new M3EnumerationLiteral(jsonNode.id, { name: name, key: key })
                nodeMap.set(jsonNode.id, literal)
            } else if (isPrimitiveType(jsonNode)) {
                const primitiveType = new M3PrimitiveType(jsonNode.id, { name: name, key: key })
                nodeMap.set(jsonNode.id, primitiveType)
            } else if (isLanguage(jsonNode)) {
                const version = NodeUtils.findPropertyValue(jsonNode, MetaPointers.LanguageVersion) ?? "unknown"
                const key = NodeUtils.findPropertyValue(jsonNode, MetaPointers.IKeyedKey) ?? "unknown"
                const name = NodeUtils.findPropertyValue(jsonNode, MetaPointers.INamedName) ?? "unknown"
                const language = new M3Language(jsonNode.id, { name: name, version: version, key: key })
                nodeMap.set(jsonNode.id, language)
                languages.push(language)
            } else {
                throw new Error(`M3 concept classifier ${JSON.stringify(jsonNode.classifier)} not handled`)
            }
        })
        jsonChunk.nodes.forEach(jsonNode => {
            // Now that we have them all instantiated, instantiate all parent-child relationships
            if (isClassifier(jsonNode)) {
                const classifier = nodeMap.get(jsonNode.id) as M3Classifier
                const containments = NodeUtils.findContainment(jsonNode, MetaPointers.ClassifierFeatures)
                containments?.children.forEach(childId => {
                    const childNode = nodeMap.get(childId)
                    if (childNode !== undefined) {
                        if (childNode instanceof M3Property) {
                            classifier.m3properties.push(childNode)
                        } else if (childNode instanceof M3Containment) {
                            classifier.m3containments.push(childNode)
                        } else if (childNode instanceof M3Reference) {
                            classifier.m3references.push(childNode)
                        }
                    } else {
                        throw new Error(`Containment ClassifierFeatures child ${childId} not found`)
                    }
                })
            } else if (isLanguage(jsonNode)) {
                const language = nodeMap.get(jsonNode.id) as M3Language
                const entities = NodeUtils.findContainment(jsonNode, MetaPointers.LanguageEntities)
                entities?.children.forEach(childId => {
                    const childNode = nodeMap.get(childId)
                    if (childNode !== undefined) {
                        if (childNode instanceof M3LanguageEntity) {
                            language.entities.push(childNode)
                        }
                    } else {
                        throw new Error(`Containment LanguageEntities child ${childId} not found`)
                    }
                })
            } else if (isEnumeration(jsonNode)) {
                const enumeration = nodeMap.get(jsonNode.id) as M3Enumeration
                const literals = NodeUtils.findContainment(jsonNode, MetaPointers.EnumerationLiterals)
                literals?.children.forEach(childId => {
                    const childNode = nodeMap.get(childId)
                    if (childNode !== undefined) {
                        if (childNode instanceof M3EnumerationLiteral) {
                            enumeration.literals.push(childNode)
                        } else {
                            console.error(`Containment Enumeration child ${childId} not found`)
                        }
                    } else {
                        throw new Error(`Containment EnumerationLiteral child ${childId} not found`)
                    }
                })
            }
            // Now that we have them all instantiated, try to resolve all metapointers
            if (isConcept(jsonNode)) {
                const classifier = nodeMap.get(jsonNode.id) as M3Concept
                const extends_ = NodeUtils.findReference(jsonNode, MetaPointers.ConceptExtends)
                if (extends_ !== undefined) {
                    const extendRef = extends_.targets
                    if (extendRef !== undefined && extendRef.length > 0) {
                        const extendedConcept = nodeMap.get(extends_.targets[0].reference) as M3Concept
                        classifier.extends = extendedConcept
                    }
                }
                const implments = NodeUtils.findReference(jsonNode, MetaPointers.ConceptImplements)
                if (implments !== undefined) {
                    const implementedInterfaces = implments.targets.map(t => nodeMap.get(t.reference)) as M3Interface[]
                    classifier.implements = implementedInterfaces
                }
            } else if (isAnnotation(jsonNode)) {
                const annotation = nodeMap.get(jsonNode.id) as M3Annotation
                const extends_ = NodeUtils.findReference(jsonNode, MetaPointers.AnnotationExtends)
                if (extends_ !== undefined) {
                    // TODO Check instanceof M3Annotation
                    const extendRef = extends_.targets
                    if (extendRef !== undefined && extendRef.length > 0) {
                        const extendedConcept = nodeMap.get(extends_.targets[0].reference) as M3Annotation
                        annotation.extends = extendedConcept
                    }
                }
                const implments = NodeUtils.findReference(jsonNode, MetaPointers.AnnotationImplements)
                if (implments !== undefined) {
                    const implementedInterfaces = implments.targets.map(t => nodeMap.get(t.reference)) as M3Interface[]
                    annotation.implements = implementedInterfaces
                }
                const annotates = NodeUtils.findReference(jsonNode, MetaPointers.AnnotationAnnotates)
                if (annotates !== undefined) {
                    const extendedConcept = nodeMap.get(annotates.targets[0].reference) as M3Classifier
                    annotation.annotates = extendedConcept
                }
            } else if (isInterface(jsonNode)) {
                const classifier = nodeMap.get(jsonNode.id) as M3Interface
                const xtends = NodeUtils.findReference(jsonNode, MetaPointers.InterfaceExtends)
                if (xtends !== undefined) {
                    const extendedInterfaces = xtends.targets.map(t => nodeMap.get(t.reference)) as M3Interface[]
                    classifier.extends = extendedInterfaces
                }
            } else if (isLink(jsonNode)) {
                const link = nodeMap.get(jsonNode.id) as M3Link
                const type = NodeUtils.findReference(jsonNode, MetaPointers.LinkType)
                if (type !== undefined) {
                    const classifier = type.targets.map(t => nodeMap.get(t.reference))[0] as M3Classifier
                    link.type = classifier
                }
            } else if (isLanguage(jsonNode)) {
                console.log("LANGUAGE DEPENDSON")
                const language = nodeMap.get(jsonNode.id) as M3Language
                if (language !== undefined) {
                    const dependsOn = NodeUtils.findReference(jsonNode, MetaPointers.LanguageDependsOn)
                    if (dependsOn === undefined) {
                        console.error("LionWebLanguageBuilder: dependsOn reference is missing")
                        // throw new Error("LionWebLanguageBuilder: dependsOn is undefined")
                    }
                    dependsOn?.targets.forEach(target => {
                        const targetNode = nodeMap.get(target.reference)
                        if (targetNode !== undefined) {
                            if (targetNode instanceof M3Language) {
                                language.dependsOn.push(targetNode)
                            }
                        } else {
                            throw new Error(`LionWebLanguageBuilder: DependsOn ${target} not found`)
                        }
                    })
                } else {
                    console.error(`LionWebLanguageBuilder: Language widt id ${jsonNode.id} is missing`)
                    // throw new Error("LionWebLanguageBuilder: Language for dependsOn is undefined")
                }
            } else if (isProperty(jsonNode)) {
                const property = nodeMap.get(jsonNode.id) as M3Property
                const type = NodeUtils.findReference(jsonNode, MetaPointers.PropertyType)
                // this.assert(type !== undefined, "property type is undefined")
                if (type !== undefined) {
                    const targets = type.targets
                    if (targets.length !== 1) {
                        console.error(`LionWebLanguageBuilder: targets lemngth for proeprty type should be 1 is  ${targets.length} not found`)
                    }
                    const datatype = nodeMap.get(targets[0].reference) as M3Datatype
                    property.type = datatype
                } else {
                    console.error(`LionWebLanguageBuilder: Property type reference for ${jsonNode.id} not found`)   
                }
            }
        })
        return languages
    }

    assert(b: boolean, msg: string): void {
        if (!b) {
            console.error(msg)
            throw new Error("LionWebLanguageBuilder: " + msg)
        }
    }
}
