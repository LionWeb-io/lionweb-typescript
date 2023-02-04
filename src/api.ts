import {Node} from "./types.ts"
import {Concept, Feature} from "./m3/types.ts"
import {
    flatMapNonCyclingFollowing,
    trivialFlatMapper
} from "./utils/recursion.ts"


export type ConceptDeducer<NT extends Node> = (node: NT) => Concept

/**
 * An interface that defines an API for in-memory models.
 * Instances/implementations of this interface parametrize generic (de-)serialization.
 * Implementations of ModelAPI {w|c}ould be:
 *  - specific to LIoncore (so to match m3/types.ts)
 *  - generic just to deserialize into Node & { settings: { [featureName: string]: any } } -- á la Federico
 */
export interface ModelAPI<NT extends Node> {

    /**
     * @return the {@link Concept concept} of the given node
     */
    conceptOf: ConceptDeducer<NT>

    /**
     * @return an instance of the concept, given through its ID, also given its parent (or {@link undefined} for root nodes), and the values of the node's properties ("settings")
     * (The latter may be required as arguments for the constructor of a class, whose instances represent nodes.)
     */
    nodeFor: (parent: NT | undefined, concept: Concept, id: string, settings: { [propertyId: string]: unknown }) => NT

    /**
     * Sets the *single* given value of the indicated {@link Feature} on the given node.
     * This means adding it in case the feature is multi-valued, meaning it is a {@link Link} with {@code multiple = true}.
     */
    setFeatureValue: (node: NT, feature: Feature, value: unknown) => void

    /**
     * @return the children of the given node
     */
    childrenOf: (node: NT) => NT[]

}
// TODO  could separate this in write- and read-only parts


/**
 * @return a function that extracts *all* nodes from a model given as a start node (presumably a root node)
 */
export const nodesExtractorUsing = <NT extends Node>(modelAPI: ModelAPI<NT>) =>
    flatMapNonCyclingFollowing(trivialFlatMapper, modelAPI.childrenOf)

