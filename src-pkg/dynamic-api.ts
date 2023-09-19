import {Node} from "./types.js"
import {ReadModelAPI, updateSettingsKeyBased, WriteModelAPI} from "./api.js"
import {Concept} from "./m3/types.js"


/**
 * Type definition for "dynamic nodes" that are not backed by specific types (e.g. classes).
 */
export type DynamicNode = Node & {
    concept: Concept
    settings: Record<string, unknown>
}
// TODO  could also have properties, containments, references - mimicking the serialization


/**
 * An implementation of {@link ReadModelAPI} for {@link DynamicNode dynamic nodes}.
 */
export const dynamicReadModelAPI: ReadModelAPI<DynamicNode> = ({
    conceptOf: (node) => node.concept,
    getFeatureValue: (node, feature) =>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node.settings as any)[feature.key],
    enumerationLiteralFrom: (value, enumeration) =>
        enumeration.literals.find(({key}) => key === value)
        ?? null    // (undefined -> null)
})


/**
 * An implementation of {@link WriteModelAPI} for {@link DynamicNode dynamic nodes}.
 */

export const dynamicWriteModelAPI: WriteModelAPI<DynamicNode> = ({
    nodeFor: (_parent, concept, id, _propertySettings) => ({
        id,
        concept,
        settings: {}
    } as DynamicNode),
    setFeatureValue: (node, feature, value) => {
        updateSettingsKeyBased(node.settings, feature, value)
    },
    encodingOf: ({key}) => key
})

