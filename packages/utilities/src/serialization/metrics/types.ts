import { LionWebKey } from "@lionweb/json"

type OptionallyNamed = {
    name?: string   // == name when it can be looked up
}

type LanguagePointer = {
    key: LionWebKey
    version: string
} & OptionallyNamed

/* abstract */ type ClassifierPointer = {
    language: LanguagePointer
    key: LionWebKey         // key of classifier
} & OptionallyNamed

type ClassifierMetaTypes = "annotation" | "concept" | "interface"

type ClassifierInstantiationMetric = {
    metaType?: ClassifierMetaTypes
    instantiations: number
} & ClassifierPointer

type LanguageMetric = {
    instantiations: number
} & LanguagePointer

// TODO  order?
type Metrics = {
    languagesWithInstantiations: LanguageMetric[]   // (note: is derivable from instantiatedClassifiers, in principle)
    instantiatedClassifiers: ClassifierInstantiationMetric[]
    languagesWithoutInstantiations: LanguagePointer[]   // (note: is derivable from uninstantiatedInstantiableClassifiers, in principle)
    uninstantiatedInstantiableClassifiers: ClassifierPointer[]
}


export type {
    ClassifierInstantiationMetric,
    ClassifierMetaTypes,
    ClassifierPointer,
    LanguageMetric,
    LanguagePointer,
    Metrics
}

