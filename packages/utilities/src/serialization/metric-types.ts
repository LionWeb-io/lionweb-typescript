import {MetaPointer} from "@lionweb/core"


type OptionallyNamed = {
    name?: string   // == name when it can be looked up
}

type LanguagePointer = {
    key: string
    version: string
} & OptionallyNamed

/* abstract */ type ClassifierMetric = {
    language: LanguagePointer
    key: string         // key of classifier
} & OptionallyNamed

type ClassifierInstantiationMetric = {
    instantiations: number
    // TODO  say the classifier is a concept, or annotation (or enum)?
} & ClassifierMetric

type LanguageMetric = {
    instantiations: number
} & LanguagePointer

// TODO  define order?
type Metrics = {
    usedLanguages: LanguageMetric[]
    instantiations: ClassifierInstantiationMetric[]
    unusedConcreteConcepts: ClassifierMetric[]
    // TODO  also add which languages are mentioned but unused?
}


export type {
    ClassifierInstantiationMetric,
    LanguagePointer,
    Metrics
}

