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
    Language,
    LanguageElement,
    Link,
    M3Concept,
    NamespacedEntity,
    Property,
    Reference
} from "./types.ts"
import {isRef, unresolved} from "../references.ts"
import {sortByStringKey} from "../utils/sorting.ts"
import {cycleWith} from "../utils/cycles.ts"
import {flatMapNonCyclingFollowing} from "../utils/recursion.ts"
import {Id, Node} from "../types.ts"
import {ConceptDeducer} from "../api.ts"


/**
 * @return The type of the given {@link Feature}
 */
export const type = (feature: Feature): FeaturesContainer | Datatype | typeof unresolved =>
    (feature as (Link | Property)).type


export const isNonComputedProperty = (feature: Feature): feature is Property =>
    feature instanceof Property && !feature.computed

export const isNonComputedContainment = (feature: Feature): feature is Containment =>
    feature instanceof Containment && !feature.computed

export const isNonComputedReference = (feature: Feature): feature is Reference =>
    feature instanceof Reference && !feature.computed


/**
 * Determines whether a {@link Feature feature} is "relational",
 * i.e. it's a non-computed {@link Link containment or reference}.
 */
const isRelational = (feature: Feature): feature is Link =>
    feature instanceof Link && !feature.computed

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
 * @return the relations of the given {@link LanguageElement language element}.
 */
export const relationsOf = (element: LanguageElement): Link[] =>
    element instanceof FeaturesContainer
        ? relations(element.features)
        : []


/**
 * @return The "things", i.e. {@link M3Concept}s, contained by the given "thing".
 *  These can be: {@link LanguageElement}s, {@link Feature}s, {@link EnumerationLiteral}
 *  (and all their sub types).
 */
export const containeds = (thing: M3Concept): M3Concept[] => {
    if (thing instanceof Language) {
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
 * Performs a depth-first tree traversal of a language, "flatMapping" the `map` function on every node.
 * It avoids visiting nodes twice (to avoid potential infinite loops), but doesn't report cycles.
 */
export const flatMap = <T>(language: Language, map: (t: M3Concept) => T[]): T[] =>
    flatMapNonCyclingFollowing(map, containeds)(language)


/**
 * @return the name of the given {@link NamespacedEntity named thing}.
 */
export const nameOf = <T extends NamespacedEntity>({name}: T): string =>
    name

/**
 * @return the qualified name of the given {@link NamespacedEntity named thing}.
 */
export const qualifiedNameOf = <T extends NamespacedEntity>(t: T): string =>
    t.qualifiedName()


/**
 * @return the {@link NamespacedEntity named things} in this {@link Language language}
 *  (excluding the language itself)
 */
export const namedsOf = (language: Language): NamespacedEntity[] =>
    flatMap(language, (t) => t instanceof NamespacedEntity ? [t] : [])


/**
 * @return the key of the given {@link NamespacedEntity named thing}.
 */
export const keyOf = <T extends NamespacedEntity>({key}: T): string =>
    key


/**
 * @return the id of the given {@link M3Concept}.
 */
export const idOf = <T extends M3Concept>({id}: T): string =>
    id


/**
 * Sorts the given {@link LanguageElement metamodel elements} by name.
 */
export const elementsSortedByName = (elements: LanguageElement[]) =>
    sortByStringKey(elements, nameOf)


/**
 * A sum type of {@link Concept} and {@link ConceptInterface}.
 */
export type ConceptType = Concept | ConceptInterface

/**
 * Determines whether the given {@link LanguageElement metamodel element} is
 * *concrete*, i.e. is instantiable.
 */
export const isConcrete = (thing: LanguageElement): thing is Concept =>
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
 * Determines whether the given {@link LanguageElement language element} is an {@link Enumeration enumeration}.
 */
export const isEnumeration = (element: LanguageElement): element is Enumeration =>
    element instanceof Enumeration


/**
 * @return a function that looks up a concept from the given {@link Language language} by its ID.
 */
export const idBasedConceptDeducerFor = (language: Language) =>
    (id: Id) =>
        language.elements.find((element) => element instanceof Concept && element.id === id) as Concept

/**
 * @return a function that looks up a concept from the given {@link Language language} by its name.
 */
export const nameBasedConceptDeducerFor = (language: Language) =>
    (name: string) =>
        language.elements.find((element) => element instanceof Concept && element.name === name) as Concept


/**
 * @return a {@link ConceptDeducer concept deducer} that deduces the concept of nodes by looking up
 * the concept in the given {@link Language language} by matching the node object's class name to the concept's name.
 */
export const classBasedConceptDeducerFor = <NT extends Node>(language: Language): ConceptDeducer<NT> => {
    const deducer = nameBasedConceptDeducerFor(language)
    return (node: NT) => deducer(node.constructor.name)
}

