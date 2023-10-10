import {Node} from "./types.js"
import {Classifier, Enumeration, EnumerationLiteral, Feature, Link} from "./m3/types.js"
import {flatMapNonCyclingFollowing, trivialFlatMapper} from "./utils/recursion.js"
import {allFeaturesOf, isContainment} from "./m3/functions.js"


/**
 * Type def. for functions that deduce the {@link Classifier classifier} of a given {@link Node node}.
 */
type ClassifierDeducer<NT extends Node> = (node: NT) => Classifier


/**
 * Two interfaces that defines façades for in-memory models.
 * Instances/implementations of this interface parametrize generic (de-)serialization.
 * Implementations of these interfaces {w|c}ould be:
 *  - specific to Lioncore (so to match m3/types.ts)
 *  - generic to deserialize into @link DynamicNode}
 */


interface ExtractionFacade<NT extends Node> {

    /**
     * @return Whether the given {@link Node node} belongs to any of the languages supported by this {@link ReadModelAPI API}.
     */
    supports: (node: Node) => boolean

    /**
     * @return The {@link Concept concept} of the given node
     */
    classifierOf: ClassifierDeducer<NT>

    /**
     * @return The value of the given {@link Feature feature} on the given node.
     */
    getFeatureValue: (node: NT, feature: Feature) => unknown
// TODO  split to getPropertyValue, &c.?

    /**
     * @return The {@link EnumerationLiteral} corresponding to
     * the given {@link Enumeration} and the runtime encoding of a literal of it,
     */
    enumerationLiteralFrom: (encoding: unknown, enumeration: Enumeration) => EnumerationLiteral | null

}

interface InstantiationFacade<NT extends Node> {

    /**
     * @return An instance of the given concept, also given its parent (or {@link undefined} for root nodes),
     * its ID and the values of the node's properties ("settings").
     * (The latter may be required as arguments for the constructor of a class, whose instances represent nodes.)
     */
    nodeFor: (parent: NT | undefined, classifier: Classifier, id: string, propertySettings: { [propertyKey: string]: unknown }) => NT

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

/**
 * Type def. for functions that extract {@link Node nodes} from a given one.
 */
type NodesExtractor<NT extends Node> = (nodes: NT) => NT[]

/**
 * @return A function that extracts the children from a given node.
 */
const childrenExtractorUsing = <NT extends Node>(extractionFacade: ExtractionFacade<NT>): NodesExtractor<NT> =>
    (node: NT): NT[] =>
        allFeaturesOf(extractionFacade.classifierOf(node))
            .filter(isContainment)
            .flatMap((containment) => extractionFacade.getFeatureValue(node, containment) as NT[])


/**
 * @return a function that extracts *all* nodes from a given start node - usually a root node.
 */
const nodesExtractorUsing = <NT extends Node>(extractionFacade: ExtractionFacade<NT>): NodesExtractor<NT> =>
    flatMapNonCyclingFollowing(trivialFlatMapper, childrenExtractorUsing<NT>(extractionFacade))


/**
 * Updates the value of the given {@link Feature feature} on the given "settings" object
 * (either a {@link Node node} or a sub object of it), using the feature's *name*.
 */
const updateSettingsNameBased = (settings: Record<string, unknown>, feature: Feature, value: unknown): void => {
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

/**
 * Updates the value of the given {@link Feature feature} on the given "settings" object
 * (either a {@link Node node} or a sub object of it), using the feature's *key*.
 */
const updateSettingsKeyBased = (settings: Record<string, unknown>, feature: Feature, value: unknown): void => {
    const {key} = feature
    if (feature instanceof Link && feature.multiple) {
        if (!Array.isArray(settings[key])) {
            settings[key] = []
        }
        (settings[key] as unknown[]).push(value)
    } else {
        settings[key] = value
    }
}

export type {
    ClassifierDeducer,
    NodesExtractor,
    ExtractionFacade,
    InstantiationFacade
}

export {
    childrenExtractorUsing,
    nodesExtractorUsing,
    updateSettingsKeyBased,
    updateSettingsNameBased
}

