import {
    Datatype,
    Enumeration,
    Feature,
    FeaturesContainer,
    Link,
    M3Concept,
    Metamodel,
    MetamodelElement,
    Multiplicity,
    Property
} from "./types.ts"
import {unresolved} from "../references.ts"


export const isPlural = (multiplicity: Multiplicity): boolean =>
        multiplicity === Multiplicity.ZeroOrMore
    ||  multiplicity === Multiplicity.OneOrMore


type Typed = Link | Property

export const type = (feature: Feature): FeaturesContainer | Datatype | typeof unresolved =>
    (feature as Typed).type


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


export type Comparer<T> = (l: T, r: T) => number

const stringCompare: Comparer<string> = (l, r): number =>
    l === r ? 0 : (l > r ? 1 : -1)

export const stringyCompare = <T>(keyFunc: (t: T) => string): Comparer<T> =>
    (l: T, r: T) => stringCompare(keyFunc(l), keyFunc(r))

export const sortByStringKey = <T>(ts: T[], keyFunc: (t: T) => string) =>
    [...ts].sort(stringyCompare(keyFunc))


export const flatMap = <T>(metamodel: Metamodel, map: (t: M3Concept) => T[]): T[] => {
    // (non-fancy, slightly non-FP-ish implementation of a depth-first tree traversal of a LIonCore instance)
    const ts: T[] = []
    const visit = (thing: M3Concept) => {
        ts.push(...map(thing))
        // recurse into all containments:
        if (thing instanceof Metamodel) {
            thing.elements.forEach(visit)
        }
        if (thing instanceof FeaturesContainer) {
            thing.features.forEach(visit)
        }
        if (thing instanceof Enumeration) {
            thing.literals.forEach(visit)
        }
    }
    visit(metamodel)
    return ts
}

