import {parse} from "https://deno.land/x/xml/mod.ts"


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

export const textAsEcoreXml = (data: string): EcoreXml =>
    parse(data, {emptyToNull: false, reviveNumbers: false}) as unknown as EcoreXml


export type AnyNumberOf<T> = undefined | T | T[]

export const asArray = <T>(thing: AnyNumberOf<T>): T[] => {
    if (thing === undefined) {
        return []
    }
    if (Array.isArray(thing)) {
        return thing
    }
    return [thing]
}


