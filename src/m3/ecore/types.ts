import {mod_parse as parse} from "../../deps.ts"


/**
 * Type definitions that correspond to an Ecore XML metamodel (file),
 * parsed using the XML parser built-in to Deno.
 */

export type ENamed = {
    "@name": string
}

export type EcoreXml = {
    "ecore:EPackage": EcorePackage
}

export type EcorePackage = ENamed & {
    "eClassifiers": EClassifier[]
}

export type EClassifier = EClass

export type EClass = ENamed & {
    "@xsi:type": "ecore:EClass"
    "@eSuperTypes"?: string
    "eStructuralFeatures"?: AnyNumberOf<EStructuralFeature>
}

export type EStructuralFeature = EAttribute | EReference

export type EAttribute = ENamed & {
    "@xsi:type": "ecore:EAttribute"
    "@lowerBound": string   // number
    "@eType": string
}

export type EReference = ENamed & {
    "@xsi:type": "ecore:EReference"
    "@lowerBound"?: string   // number
    "@upperBound": string   // number
    "@eType": string    // `#//${targetType.name}`
    "@containment": boolean
}


/**
 * Parse the given string as Ecore XML into objects matching the type definitions above.
 */
export const textAsEcoreXml = (data: string): EcoreXml =>
    parse(data, {emptyToNull: false, reviveNumbers: false}) as unknown as EcoreXml


/**
 * Feature values that are parsed from an Ecore XML metamodel file
 * can be either `undefined`, a single object, or an array of objects,
 * regardless of the actual cardinality of that feature.
 */
export type AnyNumberOf<T> = undefined | T | T[]

/**
 * Turns a {@link AnyNumberOf feature's value} into an array of objects
 * (possibly empty), regardless of the feature's cardinality and how its
 * value happened to be parsed.
 */
export const asArray = <T>(thing: AnyNumberOf<T>): T[] => {
    if (thing === undefined) {
        return []
    }
    if (Array.isArray(thing)) {
        return thing
    }
    return [thing]
}

