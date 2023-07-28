import {Node} from "./types.ts"
import {Concept, Feature, Link} from "./m3/types.ts"
import {flatMapNonCyclingFollowing, trivialFlatMapper} from "./utils/recursion.ts"
import {allFeaturesOf, isContainment} from "./m3/functions.ts"


export type ConceptDeducer<NT extends Node> = (node: NT) => Concept

/**
 * An interface that defines an API for in-memory models.
 * Instances/implementations of this interface parametrize generic (de-)serialization.
 * Implementations of ModelAPI {w|c}ould be:
 *  - specific to LIoncore (so to match m3/types.ts)
 *  - generic just to deserialize into Node & { settings: { [featureName: string]: unknown } } -- á la Federico
 */
export interface ModelAPI<NT extends Node> {

    /**
     * @return the {@link Concept concept} of the given node
     */
    conceptOf: ConceptDeducer<NT>

    /**
     * @return the value of the given {@link Feature feature} on the given node.
     */
    getFeatureValue: (node: NT, feature: Feature) => unknown


    /**
     * @return an instance of the concept, given through its ID, also given its parent (or {@link undefined} for root nodes), and the values of the node's properties ("settings")
     * (The latter may be required as arguments for the constructor of a class, whose instances represent nodes.)
     */
    nodeFor: (parent: NT | undefined, concept: Concept, id: string, settings: { [propertyKey: string]: unknown }) => NT

    /**
     * Sets the *single* given value of the indicated {@link Feature} on the given node.
     * This means adding it in case the feature is multi-valued, meaning it is a {@link Link} with {@code multiple = true}.
     */
    setFeatureValue: (node: NT, feature: Feature, value: unknown) => void

}
// TODO  could separate this in write- and read-only parts


/**
 * @return a function that extracts the children from a given node
 */
export const childrenExtractorUsing = <NT extends Node>(api: ModelAPI<NT>) =>
    (node: NT): NT[] =>
        allFeaturesOf(api.conceptOf(node))
            .filter(isContainment)
            .flatMap((containment) => api.getFeatureValue(node, containment) as NT[])


/**
 * @return a function that extracts *all* nodes from a given start node - usually a root node
 */
export const nodesExtractorUsing = <NT extends Node>(modelAPI: ModelAPI<NT>) =>
    flatMapNonCyclingFollowing(trivialFlatMapper, childrenExtractorUsing<NT>(modelAPI))


/**
 * Updates the value of the given {@link Feature feature} on the given "settings" object
 *  - either a {@link Node node} or a sub object of it.
 */
export const updateSettings = (settings: Record<string, unknown>, feature: Feature, value: unknown) => {
    const fName = feature.name
    if (feature instanceof Link && feature.multiple) {
        if (!Array.isArray(settings[fName])) {
            settings[fName] = []
        }
        (settings[fName] as unknown[]).push(value)
    } else {
        settings[fName] = value
    }
}

