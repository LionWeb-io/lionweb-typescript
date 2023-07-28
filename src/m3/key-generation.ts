import {M3Concept} from "./types.ts"
import {qualifiedNameOf} from "./functions.ts"


/**
 * Type definition for functions that generate a key given an {@link M3Concept}.
 * Note that, in theory, key generation doesn't need to be idempotent: f(node) != f(node.havingKey(f(node)), with f of type KeyGenerator.
 */
export type KeyGenerator = (node: M3Concept) => string


/**
 * A {@link KeyGenerator key generator} for which: key = name
 */
export const nameIsKeyGenerator = (node: M3Concept) =>
    node.name


/**
 * @return A {@link KeyGenerator key generator} that generates a key with the qualified name using the given separator.
 */
export const qualifiedNameBasedKeyGenerator = (separator: string): KeyGenerator =>
    (node) => qualifiedNameOf(node, separator)

