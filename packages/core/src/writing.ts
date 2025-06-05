import { LionWebId, LionWebKey } from "@lionweb/json"

import { Classifier, EnumerationLiteral, Feature, Link } from "./m3/types.js"
import { Node } from "./types.js"


/**
 * An interface that's used to parametrize generic deserialization of serialization chunks to
 * (in-memory) nodes of the given type (parameter).
 * Implementations of these interfaces {w|c}ould be:
 *  - specific to LionCore (so to match m3/types.ts)
 * - generic to deserialize into {@link DynamicNode dynamic nodes}
 */
export interface InstantiationFacade<NT extends Node> {

    /**
     * @return An instance of the given concept, also given its parent (or {@link undefined} for root nodes),
     * its ID and the values of the node's properties ("settings").
     * (The latter may be required as arguments for the constructor of a class, whose instances represent nodes.)
     */
    nodeFor: (parent: NT | undefined, classifier: Classifier, id: LionWebId, propertySettings: { [propertyKey: LionWebKey]: unknown }) => NT
// TODO  this prohibits multiple properties with the same key but different language => use a variant of LionWebJsonProperty[] with the value already deserialized

    /**
     * Sets the *single* given value of the indicated {@link Feature} on the given node.
     * This means adding it in case the feature is multi-valued, meaning it is a {@link Link} with {@code multiple = true}.
     */
    setFeatureValue: (node: NT, feature: Feature, value: unknown) => void
// TODO  split to setPropertyValue, &c.?

    /**
     * @return The runtime encoding of the given {@link EnumerationLiteral}.
     */
    encodingOf: (literal: EnumerationLiteral) => unknown

}


type SettingsUpdater = (settings: Record<string, unknown>, feature: Feature, value: unknown) => void

const settingsUpdater = (metaKey: keyof Feature): SettingsUpdater =>
    (settings: Record<string, unknown>, feature: Feature, value: unknown): void => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        const key = (feature as any)[metaKey] as string
        if (feature instanceof Link && feature.multiple) {
            if (!Array.isArray(settings[key])) {
                settings[key] = []
            }
            (settings[key] as unknown[]).push(value)
        } else {
            settings[key] = value
        }
    }


/**
 * Updates the value of the given {@link Feature feature} on the given "settings" object
 * (either a {@link Node node} or a sub object of it), using the feature's *name*.
 */
export const updateSettingsNameBased: SettingsUpdater = settingsUpdater("name")

/**
 * Updates the value of the given {@link Feature feature} on the given "settings" object
 * (either a {@link Node node} or a sub object of it), using the feature's *key*.
 */
export const updateSettingsKeyBased = settingsUpdater("key")

