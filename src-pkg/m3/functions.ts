/**
 * Various functions on M3 models.
 */


import {
    Classifier,
    Concept,
    ConceptInterface,
    Containment,
    Datatype,
    Enumeration,
    Feature,
    IKeyed,
    INamed,
    isINamed,
    Language,
    LanguageEntity,
    Link,
    M3Concept,
    Property,
    Reference
} from "./types.js"
import {isRef, unresolved} from "../references.js"
import {sortByStringKey} from "../utils/sorting.js"
import {cycleWith} from "../utils/cycles.js"
import {flatMapNonCyclingFollowing} from "../utils/recursion.js"
import {Id, Node} from "../types.js"
import {ConceptDeducer} from "../api.js"
import {containmentChain} from "../functions.js"


/**
 * @return The type of the given {@link Feature}
 */
const type = (feature: Feature): Classifier | Datatype | typeof unresolved =>
    (feature as (Link | Property)).type


const isProperty = (feature: Feature): feature is Property =>
    feature instanceof Property

const isContainment = (feature: Feature): feature is Containment =>
    feature instanceof Containment

const isReference = (feature: Feature): feature is Reference =>
    feature instanceof Reference


/**
 * Determines whether a {@link Feature feature} is "relational",
 * i.e. it's a {@link Link containment or reference}.
 */
const isRelational = (feature: Feature): feature is Link =>
    feature instanceof Link

/**
 * @return the relations among the given {@link Feature features}.
 */
const relations = (features: Feature[]): Link[] =>
    features.filter(isRelational)

/**
 * @return the non-relations among the given {@link Feature features}.
 */
const nonRelationalFeatures = (features: Feature[]): Feature[] =>
    features.filter((feature) => !isRelational(feature))


/**
 * @return the relations of the given {@link LanguageEntity language element}.
 */
const relationsOf = (element: LanguageEntity): Link[] =>
    element instanceof Classifier
        ? relations(element.features)
        : []


/**
 * @return The "things", i.e. {@link M3Concept}s, contained by the given "thing".
 *  These can be: {@link LanguageEntity}s, {@link Feature}s, {@link EnumerationLiteral}
 *  (and all their sub types).
 */
const containeds = (thing: M3Concept): M3Concept[] => {
    if (thing instanceof Language) {
        return thing.entities
    }
    if (thing instanceof Classifier) {
        return thing.features as M3Concept[]    // (cast is necessary because of presence of Feature#classifier getter...?)
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
const flatMap = <T>(language: Language, map: (t: M3Concept) => T[]): T[] =>
    flatMapNonCyclingFollowing(map, containeds)(language)


/**
 * @return the name of the given {@link INamed named thing}.
 */
const nameOf = <T extends INamed>({name}: T): string =>
    name

/**
 * @return the concatenation of the names of the given nodes using the given separator.
 */
const concatenateNamesOf = (separator: string, nodes: M3Concept[]): string =>
    nodes
        .filter(isINamed)
        .map(nameOf)
        .join(separator)
    // !! slight overkill: every node in an M2 is an M3Concept, so IKeyed and INamed

/**
 * @return the qualified name of the given {@link INamed named thing}.
 */
const qualifiedNameOf = <T extends INamed>(node: T, separator = "."): string =>
    concatenateNamesOf(separator, containmentChain(node).reverse() as M3Concept[])


/**
 * @return the {@link INamed named things} in this {@link Language language}
 *  (excluding the language itself)
 */
const namedsOf = (language: Language): M3Concept[] =>
    flatMap(language, (t) => isINamed(t) ? [t] : [])


/**
 * @return the key of the given {@link INamed named thing}.
 */
const keyOf = <T extends IKeyed>({key}: T): string =>
    key


/**
 * @return the id of the given {@link M3Concept}.
 */
const idOf = <T extends M3Concept>({id}: T): string =>
    id


/**
 * Sorts the given {@link LanguageEntity language entities} by name.
 */
const entitiesSortedByName = (entities: LanguageEntity[]) =>
    sortByStringKey(entities, nameOf)


/**
 * A sum type of {@link Concept} and {@link ConceptInterface}.
 */
type ConceptType = Concept | ConceptInterface

/**
 * Determines whether the given {@link LanguageEntity metamodel element} is
 * *concrete*, i.e. is instantiable.
 */
const isConcrete = (thing: LanguageEntity): thing is Concept =>
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
const inheritedCycleWith = (conceptType: ConceptType) =>
    cycleWith(conceptType, inheritsFrom)


/**
 * @return *all* super types (through `extends` or `implements`) of the given
 *  {@link Concept concept} or {@link ConceptInterface concept interface}.
 */
const allSuperTypesOf = (conceptType: ConceptType): ConceptType[] =>
    flatMapNonCyclingFollowing(inheritsFrom, inheritsFrom)(conceptType)


/**
 * @return *all* {@link Feature features} of the given {@link Concept concept} or {@link ConceptInterface concept interface},
 * including the inherited ones.
 */
const allFeaturesOf = (conceptType: ConceptType): Feature[] =>
    flatMapNonCyclingFollowing((ci) => ci.features, inheritsFrom)(conceptType)


/**
 * Determines whether the given {@link LanguageEntity language element} is an {@link Enumeration enumeration}.
 */
const isEnumeration = (element: LanguageEntity): element is Enumeration =>
    element instanceof Enumeration


/**
 * @return a function that looks up a concept from the given {@link Language language} by its ID.
 */
const idBasedConceptDeducerFor = (language: Language) =>
    (id: Id) =>
        language.entities.find((element) => element instanceof Concept && element.id === id) as Concept

/**
 * @return a function that looks up a concept from the given {@link Language language} by its name.
 */
const nameBasedConceptDeducerFor = (language: Language) =>
    (name: string) =>
        language.entities.find((element) => element instanceof Concept && element.name === name) as Concept


/**
 * @return a {@link ConceptDeducer concept deducer} that deduces the concept of nodes by looking up
 * the concept in the given {@link Language language} by matching the node object's class name to the concept's name.
 */
const classBasedConceptDeducerFor = <NT extends Node>(language: Language): ConceptDeducer<NT> => {
    const deducer = nameBasedConceptDeducerFor(language)
    return (node: NT) => deducer(node.constructor.name)
}


export {
    allFeaturesOf,
    allSuperTypesOf,
    classBasedConceptDeducerFor,
    concatenateNamesOf,
    containeds,
    containmentChain,
    entitiesSortedByName,
    flatMap,
    idBasedConceptDeducerFor,
    idOf,
    inheritedCycleWith,
    isConcrete,
    isContainment,
    isEnumeration,
    isProperty,
    isReference,
    keyOf,
    nameBasedConceptDeducerFor,
    nameOf,
    namedsOf,
    nonRelationalFeatures,
    relations,
    relationsOf,
    type,
    qualifiedNameOf
}

export type {
    ConceptType
}

