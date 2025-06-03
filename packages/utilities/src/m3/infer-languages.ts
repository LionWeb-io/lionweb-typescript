import {
    builtinPrimitives,
    Concept,
    Containment,
    Language,
    Link,
    Property,
    Reference
} from "@lionweb/core"
import { LionWebId, LionWebJsonChunk, LionWebKey } from "@lionweb/json"
import { asArray, chain, concatenator, lastOf } from "@lionweb/ts-utils"
import { hasher } from "../hashing.js"

const possibleKeySeparators = ["-", "_"]

const id = chain(concatenator("-"), hasher())
const key = lastOf

const { stringDatatype, booleanDatatype, integerDatatype } = builtinPrimitives

export const inferLanguagesFromSerializationChunk = (chunk: LionWebJsonChunk): Language[] => {
    const languages = new Map<string, Language>()
    const concepts = new Map<string, Concept>()
    const links = new Array<{ link: Link; conceptId: LionWebId }>()

    for (const chunkLanguage of chunk.languages) {
        const languageName = chunkLanguage.key
        const language = new Language(languageName, chunkLanguage.version, id(languageName), key(languageName))
        languages.set(languageName, language)
    }

    for (const node of chunk.nodes) {
        const languageName = node.classifier.language
        const entityName = node.classifier.key

        const language = findLanguage(languages, languageName)
        if (language.entities.filter(entity => entity.key === entityName).length) {
            continue
        }

        const concept = new Concept(language, entityName, key(language.name, entityName), id(language.name, entityName), false)
        language.havingEntities(concept)
        concepts.set(node.id, concept)

        for (const property of node.properties) {
            const propertyName = deriveLikelyPropertyName(property.property.key)
            if (concept.features.filter(feature => feature.key === propertyName).length) {
                continue
            }

            const feature = new Property(
                concept,
                propertyName,
                key(languageName, concept.name, propertyName),
                id(languageName, concept.name, propertyName)
            ).havingKey(property.property.key)

            if (property.value === null) {
                feature.isOptional()
            } else {
                if (isBoolean(property.value)) {
                    feature.ofType(booleanDatatype)
                } else if (isNumeric(property.value)) {
                    feature.ofType(integerDatatype)
                } else {
                    feature.ofType(stringDatatype)
                }
            }

            concept.havingFeatures(feature)
        }

        for (const containment of node.containments) {
            const containmentName = containment.containment.key

            if (concept.features.filter(feature => feature.key === containmentName).length) {
                continue
            }

            const children = asArray(containment.children)
            const feature = new Containment(
                concept,
                containmentName,
                key(languageName, concept.name, containmentName),
                id(languageName, concept.name, containmentName)
            )
            if (children.length) {
                feature.isMultiple()
            }
            concept.havingFeatures(feature)

            links.push({ link: feature, conceptId: children[0] })
        }

        for (const reference of node.references) {
            const referenceName = reference.reference.key
            if (concept.features.filter(feature => feature.key === referenceName).length) {
                continue
            }

            const feature = new Reference(
                concept,
                referenceName,
                key(languageName, concept.name, referenceName),
                id(languageName, concept.name, referenceName)
            )
            concept.havingFeatures(feature)

            const value = reference.targets[0].reference
            links.push({ link: feature, conceptId: value })
        }
    }

    for (const link of links) {
        const linkedConcept = concepts.get(link.conceptId)
        if (linkedConcept) {
            link.link.ofType(linkedConcept)
        } else {
            // Containment of primitive types??
        }
    }

    return Array.from(languages.values())
}

const findLanguage = (languages: Map<string, Language>, languageName: string) => {
    const language = languages.get(languageName)
    if (language === undefined) {
        throw new Error(`Language '${languageName} does not exist in the languages section`)
    }
    return language
}

export const deriveLikelyPropertyName = (key: LionWebKey) => {
    for (const separator of possibleKeySeparators) {
        const name = key.split(separator)[2]
        if (name) {
            return name
        }
    }

    return key
}

const isBoolean = (value: string) => value === "true" || value === "false"

const isNumeric = (value: string) => !isNaN(parseFloat(value))
