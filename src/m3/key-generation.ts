import {INamed, M3Concept as _M3Concept} from "./types.ts"
import {qualifiedNameOf} from "./functions.ts"


/**
 * Type definition for functions that generate a key given an {@link _M3Concept M3Concept}.
 * Note that, in theory, key generation doesn't need to be idempotent: f(node) != f(node.havingKey(f(node)), with f of type KeyGenerator.
 */
export type KeyGenerator = (node: INamed) => string


/**
 * A {@link KeyGenerator key generator} for which: key = name
 */
export const nameIsKeyGenerator: KeyGenerator = (node: INamed) =>
    node.name


/**
 * @return A {@link KeyGenerator key generator} that generates a key with the qualified name using the given separator.
 */
export const qualifiedNameBasedKeyGenerator = (separator: string): KeyGenerator =>
    (node) => qualifiedNameOf(node, separator)


// TODO  implement checkers
