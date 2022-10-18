import {
    AbstractConcept,
    Datatype,
    Feature,
    Link,
    MetamodelElement,
    Multiplicity,
    Property,
    unresolved
} from "./types.ts"


export const isPlural = (multiplicity: Multiplicity): boolean =>
        multiplicity === Multiplicity.ZeroOrMore
    ||  multiplicity === Multiplicity.OneOrMore


type Typed = Link | Property

export const type = (feature: Feature): AbstractConcept | Datatype | typeof unresolved =>
    (feature as Typed).type


const isRelational = (feature: Feature): feature is Link =>
    feature instanceof Link && !feature.derived

export const relations = (features: Feature[]): Link[] =>
    features.filter(isRelational)

export const nonRelationalFeatures = (features: Feature[]): Feature[] =>
    features.filter((feature) => !isRelational(feature))


export const relationsOf = (metamodelElement: MetamodelElement): Link[] =>
    metamodelElement instanceof AbstractConcept
        ? relations(metamodelElement.features)
        : []


export type Comparer<T> = (l: T, r: T) => number

const stringCompare: Comparer<string> = (l, r): number =>
    l === r ? 0 : (l > r ? 1 : -1)

export const stringyCompare = <T>(keyFunc: (t: T) => string): Comparer<T> =>
    (l: T, r: T) => stringCompare(keyFunc(l), keyFunc(r))

export const sortByStringKey = <T>(ts: T[], keyFunc: (t: T) => string) =>
    [...ts].sort(stringyCompare(keyFunc))

