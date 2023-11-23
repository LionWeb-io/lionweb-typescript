import {Node} from "./types.js"
import {builtinFeatures} from "./m3/builtins.js"
import {ExtractionFacade, InstantiationFacade, ResolveInfoDeducer, updateSettingsKeyBased} from "./facade.js"
import {Classifier} from "./m3/types.js"


/**
 * Type definition for "dynamic nodes" that are not backed by specific types (e.g. classes).
 */
export type DynamicNode = Node & {
    classifier: Classifier
    settings: Record<string, unknown>
}
// TODO  could also have properties, containments, references - mimicking the serialization


const propertyGetterFor = (key: string): ResolveInfoDeducer<DynamicNode> =>
    (node) =>
        (key in node.settings && typeof node.settings[key] === "string")
            ? node.settings[key] as string  // FIXME  type cast shouldn't be necessary
            : undefined

/**
 * An implementation of {@link ExtractionFacade} for {@link DynamicNode dynamic nodes}.
 */
export const dynamicExtractionFacade: ExtractionFacade<DynamicNode> = ({
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
 * An implementation of {@link InstantiationFacade} for {@link DynamicNode dynamic nodes}.
 */

export const dynamicInstantiationFacade: InstantiationFacade<DynamicNode> = ({
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

