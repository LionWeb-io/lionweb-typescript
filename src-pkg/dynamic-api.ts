import {Node} from "./types.js"
import {ModelAPI, updateSettingsKeyBased} from "./api.js"
import {Concept} from "./m3/types.js"


/**
 * Type definition for "dynamic nodes" that are not backed by specific types (e.g. classes).
 */
export type DynamicNode = Node & {
    concept: Concept
    settings: Record<string, unknown>
}


/**
 * An implementation of {@link ModelAPI} for {@link DynamicNode dynamic nodes}.
 */
export const dynamicModelAPI: ModelAPI<DynamicNode> = ({
    conceptOf: (node) => node.concept,
    getFeatureValue: (node, feature) =>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node.settings as any)[feature.name],
    enumerationLiteralFrom: (value, enumeration) =>
        enumeration.literals.find(({key}) => key === value)
            ?? null,    // (undefined -> null)
    nodeFor: (_parent, concept, id, _settings) => ({
        id,
        concept,
        settings: {}
    }),
    setFeatureValue: (node, feature, value) => {
        updateSettingsKeyBased(node.settings, feature, value)
    },
    encodingOf: ({key}) => key
})

