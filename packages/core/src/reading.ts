import { Classifier, Enumeration, EnumerationLiteral, Feature, Reference } from "./m3/index.js"
import { Node } from "./types.js"


/**
 * Type def. for functions that deduce the {@link Classifier classifier} of a given {@link Node node}.
 */
export type ClassifierDeducer<NT extends Node> = (node: NT) => Classifier

/**
 * Type def. for functions that deduce the string value of the `resolveInfo` field of a
 * {@link LionWebJsonReferenceTarget serialized reference target},
 * or `undefined` to indicate that no `resolveInfo` could be derived.
 * The function’s arguments are the target {@link Node} and its containing {@link Reference}.
 */
export type ResolveInfoDeducer<NT extends Node> = (node: NT, reference: Reference) => string | undefined

/**
 * An interface that's used to parametrize generic serialization of
 * (in-memory) nodes of the given type (parameter) `NT`.
 * Implementations of these interfaces {w|c}ould be:
 *  - specific to LionCore (so to match m3/types.ts)
 *  - generic to serialize {@link DynamicNode dynamic nodes}
 * The `RT` type (parameter) is the type of any *referenced* node,
 * which could e.g. be wider – most likely – or narrower than `NT`.
 */
export interface Reader<NT extends Node, RT extends Node = NT> {

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

    /**
     * @return The string value of the `resolveInfo` field of a {@link LionWebJsonReferenceTarget serialized reference target},
     * or `undefined` to indicate that no `resolveInfo` could be derived.
     */
    resolveInfoFor?: ResolveInfoDeducer<RT>

}

/**
 * Alias for {@link Reader}, kept for backward compatibility, and to be deprecated and removed later.
 *
 * @deprecated Use {@link Reader} instead.
 */
export interface ExtractionFacade<NT extends Node, RT extends Node> extends Reader<NT, RT> {}

