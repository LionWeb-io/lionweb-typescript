/**
 * Various functions on M3 models.
 */


import {
    Concept,
    ConceptInterface,
    Containment,
    Datatype,
    Enumeration,
    Feature,
    FeaturesContainer,
    Link,
    M3Concept,
    Metamodel,
    MetamodelElement,
    Property,
    Reference
} from "./types.ts"
import {isRef, unresolved} from "../references.ts"
import {sortByStringKey} from "../utils/sorting.ts"
import {cycleWith} from "../utils/cycles.ts"
import {flatMapNonCyclingFollowing} from "../utils/recursion.ts"
import {Node} from "../types.ts"
import {ConceptDeducer} from "../api.ts"


/**
 * @return The type of the given {@link Feature}
 */
export const type = (feature: Feature): FeaturesContainer | Datatype | typeof unresolved =>
    (feature as (Link | Property)).type


export const isNonDerivedProperty = (feature: Feature): feature is Property =>
    feature instanceof Property && !feature.derived

export const isNonDerivedContainment = (feature: Feature): feature is Containment =>
    feature instanceof Containment && !feature.derived

export const isNonDerivedReference = (feature: Feature): feature is Reference =>
    feature instanceof Reference && !feature.derived


/**
 * Determines whether a {@link Feature feature} is "relational",
 * i.e. it's a non-derived {@link Link containment or reference}.
 */
const isRelational = (feature: Feature): feature is Link =>
    feature instanceof Link && !feature.derived

/**
 * @return the relations among the given {@link Feature features}.
 */
export const relations = (features: Feature[]): Link[] =>
    features.filter(isRelational)

/**
 * @return the non-relations among the given {@link Feature features}.
 */
export const nonRelationalFeatures = (features: Feature[]): Feature[] =>
    features.filter((feature) => !isRelational(feature))


/**
 * @return the relations of the given {@link MetamodelElement metamodel element}.
 */
export const relationsOf = (metamodelElement: MetamodelElement): Link[] =>
    metamodelElement instanceof FeaturesContainer
        ? relations(metamodelElement.features)
        : []


/**
 * @return The "things", i.e. {@link M3Concept}s, contained by the given "thing".
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
    flatMapNonCyclingFollowing(map, containeds)(metamodel)


/**
 * Sorts the given {@link MetamodelElement metamodel elements} by simple name.
 */
export const elementsSortedByName = (metamodelElements: MetamodelElement[]) =>
    sortByStringKey(metamodelElements, (element) => element.simpleName)


/**
 * A sum type of {@link Concept} and {@link ConceptInterface}.
 */
export type ConceptType = Concept | ConceptInterface

/**
 * Determines whether the given {@link MetamodelElement metamodel element} is
 * *concrete*, i.e. is instantiable.
 */
export const isConcrete = (thing: MetamodelElement): thing is Concept =>
    thing instanceof Concept && !thing.abstract

const inheritsFrom = (conceptType: ConceptType): ConceptType[] => {
    if (conceptType instanceof Concept) {
        return [
            ...(
                isRef(conceptType.extends)
                    ? [conceptType.extends as Concept]
                    : []
            ),
            ...conceptType.implements
        ]
    }
    if (conceptType instanceof ConceptInterface) {
        return conceptType.extends
    }
    throw new Error(`concept type ${typeof conceptType} not handled`)
}

/**
 * @return an array that's either an inheritance cycle, or empty (meaning: no inheritance cycle).
 */
export const inheritedCycleWith = (conceptType: ConceptType) =>
    cycleWith(conceptType, inheritsFrom)


/**
 * @return *all* super types (through `extends` or `implements`) of the given
 *  {@link Concept concept} or {@link ConceptInterface concept interface}.
 */
export const allSuperTypesOf = (conceptType: ConceptType): ConceptType[] =>
    flatMapNonCyclingFollowing(inheritsFrom, inheritsFrom)(conceptType)


/**
 * @return *all* {@link Feature features} of the given {@link Concept concept} or {@link ConceptInterface concept interface},
 * including the inherited ones.
 */
export const allFeaturesOf = (conceptType: ConceptType): Feature[] =>
    flatMapNonCyclingFollowing((ci) => ci.features, inheritsFrom)(conceptType)


/**
 * Determines whether the given {@link MetamodelElement metamodel element} is an {@link Enumeration enumeration}.
 */
export const isEnumeration = (metamodelElement: MetamodelElement): metamodelElement is Enumeration =>
    metamodelElement instanceof Enumeration


/**
 * @return all nodes in the given {@link Metamodel metamodel} that make sense to refer to.
 */
export const allReferablesOf = (metamodel: Metamodel): (Metamodel | MetamodelElement)[] =>
    [metamodel, ...metamodel.elements]


/**
 * @return a {@link ConceptDeducer concept deducer} that deduces the concept of nodes by looking up
 * the concept in the given {@link Metamodel metamodel} by matching the node object's class name to the concept's simple name.
 */
export const classBasedConceptDeducerFor = <NT extends Node>(metamodel: Metamodel): ConceptDeducer<NT> =>
    (node: NT) =>
        metamodel.elements.find((element) => element.simpleName === node.constructor.name) as Concept

