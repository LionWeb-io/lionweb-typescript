import { LionWebKey } from "@lionweb/json"
import { Classifier, LionWebVersion } from "./m3/index.js"
import { Reader, ResolveInfoDeducer } from "./reading.js"
import { Node } from "./types.js"
import { updateSettingsKeyBased, Writer } from "./writing.js"


/**
 * Type definition for "dynamic nodes" that are not backed by specific types (e.g. classes).
 */
export type DynamicNode = Node & {
    classifier: Classifier
    settings: Record<string, unknown>
    // (could also have properties, containments, references - mimicking the serialization)
}


const propertyGetterFor = (key: LionWebKey): ResolveInfoDeducer<DynamicNode> =>
    (node) =>
        (key in node.settings && typeof node.settings[key] === "string")
            ? node.settings[key] as string
            : undefined

/**
 * @return a {@link Reader} implementation for {@link DynamicNode dynamic nodes} w.r.t. the given {@link LionWebVersion}.
 */
export const dynamicReaderFor = (lionWebVersion: LionWebVersion): Reader<DynamicNode> => ({
    classifierOf: (node) => node.classifier,
    getFeatureValue: (node, feature) =>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node.settings as any)[feature.key],
    enumerationLiteralFrom: (value, enumeration) =>
        enumeration.literals.find(({key}) => key === value)
        ?? null,    // (undefined -> null)
    resolveInfoFor: propertyGetterFor(lionWebVersion.builtinsFacade.features.inamed_name.key)
})

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

