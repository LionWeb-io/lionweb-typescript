/**
 * This file contains LionWeb defined M3 keys and identifications.
 */
export const LION_CORE_BUILTINS_INAMED_NAME = "LionCore-builtins-INamed-name"
export const LION_CORE_BUILTINS_KEY = "LionCore-builtins"

export const LION_CORE_M3_KEY = "LionCore-M3"
export const LION_CORE_M3_NAME = "LionCore_M3"

export const LION_CORE_M3_VERSION = "2023.1"
// Builtin datatypes
export const LIONWEB_BOOLEAN_TYPE = "LionCore-builtins-Boolean"
export const LIONWEB_JSON_TYPE = "LionCore-builtins-JSON"
export const LIONWEB_INTEGER_TYPE = "LionCore-builtins-Integer"
export const LIONWEB_STRING_TYPE = "LionCore-builtins-String"

export const M3_Keys = {
    Property: "Property",
    Reference: "Reference",
    Concept: "Concept",
    conceptExtends: "Concept-extends",
    conceptImplements: "Concept-implements",
    concept2: {
        key: "Concept",
        extends: { key: "Concept-extends" },
        implements: { key: "Concept-implements" }
    },
    conceptAbstract: "Concept-abstract",
    conceptPartition: "Concept-partition",
    classifierFeatures: "Classifier-features",
    Interface: "Interface",
    InterfaceExtends: "Interface-extends",
    FeatureOptional: "Feature-optional",
    Containment: "Containment",
    Language: "Language",
    languageVersion: "Language-version",
    languageEntities: "Language-entities",
    LanguageDependsOn: "Language-dependsOn",
    LinkMultiple: "Link-multiple",
    LinkType: "Link-type",
    IKeyedKey: "IKeyed-key",
    PropertyType: "Property-type",
    PrimitiveType: "PrimitiveType",
    Enumeration: "Enumeration",
    EnumerationLiterals: "Enumeration-literals",
    EnumerationLiteral: "EnumerationLiteral",
    INamed: "LionCore-builtins-INamed",
    INamedName: "LionCore-builtins-INamed-name",
    Annotation: "Annotation",
    AnnotationAnnotates: "Annotation-annotates",
    AnnotationExtends: "Annotation-extends",
    AnnotationImplements: "Annotation-implements",
    Node: "LionCore-builtins-Node"
}

export const MetaPointers = {
    Language: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.Language
    },
    LanguageVersion: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.languageVersion
    },
    LanguageEntities: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.languageEntities
    },
    LanguageDependsOn: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.LanguageDependsOn
    },
    ClassifierFeatures: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.classifierFeatures
    },
    Concept: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.concept2.key
    },
    ConceptAbstract: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.conceptAbstract
    },
    ConceptPartition: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.conceptPartition
    },
    ConceptExtends: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.concept2.extends.key
    },
    ConceptImplements: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.concept2.implements.key
    },
    Annotation: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.Annotation
    },
    AnnotationAnnotates: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.AnnotationAnnotates
    },
    AnnotationExtends: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.AnnotationExtends
    },
    AnnotationImplements: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.AnnotationImplements
    },
    Interface: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.Interface
    },
    InterfaceExtends: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.InterfaceExtends
    },
    Enumeration: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.Enumeration
    },
    EnumerationLiteral: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.EnumerationLiteral
    },
    EnumerationLiterals: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.EnumerationLiterals
    },
    FeatureOptional: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.FeatureOptional
    },
    Containment: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.Containment
    },
    Property: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.Property
    },
    PropertyType: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.PropertyType
    },
    LinkMultiple: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.LinkMultiple
    },
    LinkType: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.LinkType
    },
    Reference: {
        version: LION_CORE_M3_VERSION,
        language: LION_CORE_M3_KEY,
        key: M3_Keys.Reference
    },
    PrimitiveType: {
        language: LION_CORE_M3_KEY,
        version: LION_CORE_M3_VERSION,
        key: M3_Keys.PrimitiveType
    },
    IKeyedKey: {
        language: LION_CORE_M3_KEY,
        version: LION_CORE_M3_VERSION,
        key: M3_Keys.IKeyedKey
    },
    // Builtins:
    Node: {
        language: LION_CORE_BUILTINS_KEY,
        version: LION_CORE_M3_VERSION,
        key: M3_Keys.Node
    },
    INamed: {
        language: LION_CORE_BUILTINS_KEY,
        version: LION_CORE_M3_VERSION,
        key: M3_Keys.INamed
    },
    INamedName: {
        language: LION_CORE_BUILTINS_KEY,
        version: LION_CORE_M3_VERSION,
        key: M3_Keys.INamedName
    }
}
