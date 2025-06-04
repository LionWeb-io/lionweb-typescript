import {
    LionWebJsonChunk,
    LionWebJsonContainment,
    LionWebJsonMetaPointer,
    LionWebJsonNode,
    LionWebJsonProperty,
    LionWebJsonReference,
    LionWebJsonReferenceTarget,
    LionWebJsonUsedLanguage
} from "@lionweb/json"

const orderedMetaPointer = ({ language, version, key }: LionWebJsonMetaPointer): LionWebJsonMetaPointer => ({
    language,
    version,
    key
})

const orderedSerializedLanguageReference = ({ key, version }: LionWebJsonUsedLanguage): LionWebJsonUsedLanguage => ({
    key,
    version
})

const orderedSerializedReferenceTarget = ({ reference, resolveInfo }: LionWebJsonReferenceTarget): LionWebJsonReferenceTarget => ({
    resolveInfo,
    reference
})

const orderedSerializedProperty = ({ property, value }: LionWebJsonProperty): LionWebJsonProperty => ({
    property: orderedMetaPointer(property),
    value
})

const orderedSerializedContainment = ({ containment, children }: LionWebJsonContainment): LionWebJsonContainment => ({
    containment: orderedMetaPointer(containment),
    children    // TODO  ensure [] if empty
})

const orderedSerializedReference = ({ reference, targets }: LionWebJsonReference): LionWebJsonReference => ({
    reference: orderedMetaPointer(reference),
    targets: targets.map(orderedSerializedReferenceTarget)    // TODO  ensure [] if empty
})

const orderedSerializedNode = ({
    id,
    classifier,
    properties,
    containments,
    references,
    annotations,
    parent
}: LionWebJsonNode): LionWebJsonNode => ({
    id,
    classifier: orderedMetaPointer(classifier),
    properties: properties.map(orderedSerializedProperty),
    containments: containments.map(orderedSerializedContainment),
    references: references.map(orderedSerializedReference),
    annotations,    // TODO  ensure [] if empty
    parent
})

const orderedSerializationChunk = ({ serializationFormatVersion, languages, nodes }: LionWebJsonChunk): LionWebJsonChunk => ({
    serializationFormatVersion,
    languages: languages.map(orderedSerializedLanguageReference),
    nodes: nodes.map(orderedSerializedNode)
})

export {
    orderedMetaPointer,
    orderedSerializationChunk,
    orderedSerializedLanguageReference,
    orderedSerializedProperty,
    orderedSerializedReferenceTarget
}
