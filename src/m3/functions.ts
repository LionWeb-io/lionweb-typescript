/**
 * Various functions on M3 models.
 */


import {
    Concept,
    ConceptInterface,
    Datatype,
    Enumeration,
    Feature,
    FeaturesContainer,
    Link,
    M3Concept,
    Metamodel,
    MetamodelElement,
    Property
} from "./types.ts"
import {unresolved} from "../references.ts"
import {sortByStringKey} from "../utils/sorting.ts"
import {cycleWith} from "../utils/cycles.ts"
import {flatmapNonCyclingFollowing} from "../utils/recursion.ts"


/**
 * @return The type of the given {@link Feature}
 */
export const type = (feature: Feature): FeaturesContainer | Datatype | typeof unresolved =>
    (feature as (Link | Property)).type


const isRelational = (feature: Feature): feature is Link =>
    feature instanceof Link && !feature.derived

export const relations = (features: Feature[]): Link[] =>
    features.filter(isRelational)

export const nonRelationalFeatures = (features: Feature[]): Feature[] =>
    features.filter((feature) => !isRelational(feature))


export const relationsOf = (metamodelElement: MetamodelElement): Link[] =>
    metamodelElement instanceof FeaturesContainer
        ? relations(metamodelElement.features)
        : []


/**
 * @return The “things”, i.e. {@link M3Concept}s, contained by the given “thing”.
 *  These can be: {@link MetamodelElement}s, {@link Feature}s, {@link EnumerationLiteral}
 *  (and all their sub types).
 */
export const containeds = (thing: M3Concept): M3Concept[] => {
    if (thing instanceof Metamodel) {
        return thing.elements
    }
    if (thing instanceof FeaturesContainer) {
        return thing.features
    }
    if (thing instanceof Enumeration) {
        return thing.literals
    }
    return []
}


/**
 * Performs a depth-first tree traversal of a metamodel, "flatMapping" the `map` function on every node.
 * It avoids visiting nodes twice (to avoid potential infinite loops), but doesn't report cycles.
 */
export const flatMap = <T>(metamodel: Metamodel, map: (t: M3Concept) => T[]): T[] =>
    flatmapNonCyclingFollowing(map, containeds)(metamodel)


export const elementsSortedByName = (metamodelElements: MetamodelElement[]) =>
    sortByStringKey(metamodelElements, (element) => element.simpleName)


export type ConceptType = Concept | ConceptInterface
const inheritsFrom = (conceptType: ConceptType): ConceptType[] => {
    if (conceptType instanceof Concept) {
        return [
            ...(conceptType.extends !== undefined && conceptType.extends !== unresolved ? [conceptType.extends as Concept] : []),
            ...conceptType.implements
        ]
    }
    if (conceptType instanceof ConceptInterface) {
        return conceptType.extends
    }
    throw new Error(`concept type ${typeof conceptType} not handled`)
}
export const inheritedCycleWith = (conceptType: ConceptType) =>
    cycleWith(conceptType, inheritsFrom)


export const allSuperTypesOf = (conceptType: ConceptType): ConceptType[] =>
    flatmapNonCyclingFollowing(inheritsFrom, inheritsFrom)(conceptType)


export const allFeaturesOf = (conceptType: ConceptType): Feature[] =>
    flatmapNonCyclingFollowing((ci) => ci.features, inheritsFrom)(conceptType)

