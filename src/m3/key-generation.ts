import {Language, M3Concept} from "./types.ts"


/**
 * Type definition for functions that generate a key given an {@link M3Concept}.
 * Note that, in theory, key generation doesn't need to be idempotent: f(node) != f(node.havingKey(f(node)), with f of type KeyGenerator.
 */
export type KeyGenerator = (node: M3Concept) => string
    // TODO  should have as type NamespacedEntity, but don't want to do that until propagating recent-recent changes


/**
 * A {@link KeyGenerator key generator} for which: key = name
 */
export const simpleNameIsKeyGenerator = (node: M3Concept) =>
    node.name


/**
 * @return A {@link KeyGenerator key generator} that generates a key with the qualified name using the given separator.
 */
export const qualifiedNameBasedKeyGenerator = (separator: string): KeyGenerator =>
    (node) =>
        (node instanceof Language)
            ? node.name
            : node.qualifiedName().replaceAll(".", separator)
                // FIXME  this is a hack: qualifiedName should be parametrized with a separator

