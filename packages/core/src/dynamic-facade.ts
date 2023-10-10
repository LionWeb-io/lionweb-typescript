import {Node} from "./types.js"
import {ExtractionFacade, InstantiationFacade, updateSettingsKeyBased} from "./facade.js"
import {Classifier} from "./m3/types.js"


/**
 * Type definition for "dynamic nodes" that are not backed by specific types (e.g. classes).
 */
export type DynamicNode = Node & {
    classifier: Classifier
    settings: Record<string, unknown>
}
// TODO  could also have properties, containments, references - mimicking the serialization


/**
 * A parallel version of {@link INamed} for dynamic nodes.
 * (This type def. is predominantly meant for use in generated code.)
 */
export type DynamicINamed = DynamicNode & {
    settings: {
        name: string
    }
}


/**
 * An implementation of {@link ExtractionFacade} for {@link DynamicNode dynamic nodes}.
 */
export const dynamicExtractionFacade: ExtractionFacade<DynamicNode> = ({
    supports: (node) =>
           "classifier" in node && node.classifier instanceof Classifier
        && "settings" in node && typeof node.settings === "object" && !Array.isArray(node.settings),
    classifierOf: (node) => node.classifier,
    getFeatureValue: (node, feature) =>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node.settings as any)[feature.key],
    enumerationLiteralFrom: (value, enumeration) =>
        enumeration.literals.find(({key}) => key === value)
        ?? null    // (undefined -> null)
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

