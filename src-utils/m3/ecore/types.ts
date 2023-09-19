import {AnyNumberOf} from "../../../src-pkg/index.js"


/**
 * Type definitions that correspond to an Ecore XML metamodel (file),
 * parsed using the <tt>xml2js</tt> XML parser library
 * (or with a parser exactly compatible with that.)
 *
 * For completeness' sake, the required code could look as follows:
 * ```ts
 * import {parseString} from "xml2js"
 *
 * parseString(data, (err, ecoreXml) => {
 *     const language = asLionCoreLanguage(ecoreXml as EcoreXml, "1")
 * })
 * ```
 * (It's assumed that {@link EcoreXml} is already imported.)
 */

export type ENamed = {
    "$": {
        "name": string
    }
}

export type EcoreXml = {
    "ecore:EPackage": EcorePackage
}

export type EcorePackage = ENamed & {
    "eClassifiers": EClassifier[]
}

export type EClassifier = EClass | EEnum

export type EClass = ENamed & {
    "$": {
        "xsi:type": "ecore:EClass"
        "eSuperTypes"?: string
    }
    "eStructuralFeatures"?: AnyNumberOf<EStructuralFeature>
}

export type EStructuralFeature = EAttribute | EReference

export type EAttribute = ENamed & {
    "$": {
        "xsi:type": "ecore:EAttribute"
        "lowerBound": string   // number
        "eType": string
    }
}

export type EReference = ENamed & {
    "$": {
        "xsi:type": "ecore:EReference"
        "lowerBound"?: string   // number
        "upperBound": string    // number
        "eType": string         // `#//${targetType.name}`
        "containment"?: boolean
    }
}

export type EEnum = ENamed & {
    "$": {
        "xsi:type": "ecore:EEnum"
    }
    "eLiterals"?: AnyNumberOf<EEnumLiteral>
}

export type EEnumLiteral = ENamed

