import { Node } from "./types.js"


/**
 * The `unresolved` symbol indicates a reference value which hasn't been resolved yet.
 * It differs from an unset (`undefined`) value.
 * This value shouldn’t be manipulated/compared to directly!
 */
export const unresolved = null

/**
 * Type for unresolved references.
 */
export type UnresolvedReference = typeof unresolved

/**
 * @return a value of {@link UnresolvedReference} that’s a placeholder for a yet-to-set reference.
 */
export const referenceToSet = () =>
    unresolved

/**
 * A type definition for a reference value that can be unresolved.
 * Note: this type is primarily meant to be used to type nodes’ properties,
 * but should be avoided as a return type for “auxiliary” functions.
 */
export type SingleRef<NT extends Node> = NT | UnresolvedReference

/**
 * @return whether a given (at most) single-valued reference actually refers to something.
 */
export const isRef = <NT extends Node>(ref?: SingleRef<NT>): ref is NT =>
    ref !== undefined && ref !== unresolved

/**
 * Type function for the {@link UnresolvedReference} type.
 */
export const isUnresolvedReference = <NT extends Node>(ref?: SingleRef<NT>): ref is UnresolvedReference =>
    ref === unresolved


/**
 * A type alias for a multi-valued reference, to make it look consistent with {@link SingleRef}.
 * Note: this type is primarily meant to be used to type nodes’ properties,
 * but should be avoided as a return type for “auxiliary” functions.
 */
export type MultiRef<NT extends Node> = SingleRef<NT>[]

