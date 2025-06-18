import { LionWebKey } from "@lionweb/json"
import { builtinFeatures } from "./m3/builtins.js"
import { Classifier } from "./m3/types.js"
import { Reader, ResolveInfoDeducer } from "./reading.js"
import { Node } from "./types.js"
import { updateSettingsKeyBased, Writer } from "./writing.js"


/**
 * Type definition for "dynamic nodes" that are not backed by specific types (e.g. classes).
 */
export type DynamicNode = Node & {
    classifier: Classifier
    settings: Record<string, unknown>
}
// TODO  could also have properties, containments, references - mimicking the serialization


const propertyGetterFor = (key: LionWebKey): ResolveInfoDeducer<DynamicNode> =>
    (node) =>
        (key in node.settings && typeof node.settings[key] === "string")
            ? node.settings[key] as string  // FIXME  type cast shouldn't be necessary
            : undefined

/**
 * An implementation of {@link Reader} for {@link DynamicNode dynamic nodes}.
 */
export const dynamicReader: Reader<DynamicNode> = ({
    classifierOf: (node) => node.classifier,
    getFeatureValue: (node, feature) =>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node.settings as any)[feature.key],
    enumerationLiteralFrom: (value, enumeration) =>
        enumeration.literals.find(({key}) => key === value)
        ?? null,    // (undefined -> null)
    resolveInfoFor: propertyGetterFor(builtinFeatures.inamed_name.key)
})

/**
 * Alias for {@link Reader}, kept for backward compatibility, and to be deprecated and removed later.
 */
export const dynamicExtractionFacade = dynamicReader

/**
 * An implementation of {@link Writer} for {@link DynamicNode dynamic nodes}.
 */
export const dynamicWriter: Writer<DynamicNode> = ({
    nodeFor: (_parent, classifier, id, _propertySettings) => ({
        id,
        classifier,
        settings: {}
    } as DynamicNode),
    setFeatureValue: (node, feature, value) => {
        updateSettingsKeyBased(node.settings, feature, value)
    },
    encodingOf: ({key}) => key
})

/**
 * Alias for {@link Reader}, kept for backward compatibility, and to be deprecated and removed later.
 */
export const dynamicInstantiationFacade = dynamicReader

