import {Node} from "./types.ts"
import {ModelAPI, updateSettings} from "./api.ts"
import {Concept} from "./m3/types.ts"


/**
 * Type definition for "dynamic nodes" that are not backed by specific types (e.g. classes).
 */
export type DynamicNode = Node & {
    concept: Concept
    settings: { [featureName: string]: unknown }
}


/**
 * An implementation of {@link ModelAPI} for {@link DynamicNode dynamic nodes}.
 */
export const dynamicModelAPI: ModelAPI<DynamicNode> = ({
    conceptOf: (node) => node.concept,
    getFeatureValue: (node, feature) =>
        (node.settings as any)[feature.name],
    nodeFor: (_parent, concept, id, _settings) => ({
        id,
        concept,
        settings: {}
    }),
    setFeatureValue: (node, feature, value) => {
        updateSettings(node.settings, feature, value)
    }
})

