import {AnyNumberOf} from "../../../src/index.ts"


/**
 * Type definitions that correspond to an Ecore XML metamodel (file),
 * parsed using the XML parser built-in to Deno (see {@link https://deno.land/x/xml@2.1.0/mod.ts}),
 * or with a parser exactly compatible with that.
 *
 * For completeness' sake, the required code could look as follows:
 * ```ts
 * import {parse} from "https://deno.land/x/xml@2.1.0/mod.ts"
 *
 * const textAsEcoreXml = (data: string): EcoreXml =>
 *     parse(data, {emptyToNull: false, reviveNumbers: false}) as unknown as EcoreXml
 * ```
 * (It's assumed that {@link EcoreXml} is already imported.)
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

export type EClassifier = EClass | EEnum

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

export type EEnum = ENamed & {
    "@xsi:type": "ecore:EEnum"
    "eLiterals"?: AnyNumberOf<EEnumLiteral>
}

export type EEnumLiteral = ENamed

