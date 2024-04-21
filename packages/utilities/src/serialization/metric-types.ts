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

type ClassifierMetaTypes = "annotation" | "concept" | "interface"

type ClassifierInstantiationMetric = {
    metaType?: ClassifierMetaTypes
    instantiations: number
} & ClassifierMetric

type LanguageMetric = {
    instantiations: number
} & LanguagePointer

// TODO  order?
type Metrics = {
    languagesWithInstantiations: LanguageMetric[]
    instantiatedClassifiers: ClassifierInstantiationMetric[]
    uninstantiatedInstantiableClassifiers: ClassifierMetric[]
    languagesWithoutInstantiations: LanguagePointer[]
}


export type {
    ClassifierInstantiationMetric,
    ClassifierMetaTypes,
    LanguagePointer,
    Metrics
}

