import { LionWebId } from "@lionweb/json"

import { Node } from "./types.js"


/**
 * The `unresolved` symbol indicates a reference value which hasn't been resolved yet.
 * It differs from an unset (`undefined`) value.
 */
export const unresolved = null

/**
 * A type definition for a reference value that can be unresolved.
 * Note: this type is primarily meant to be used to type nodes’ properties,
 * but should be avoided as a return type for “auxiliary” functions.
 */
export type SingleRef<T> = typeof unresolved | T

/**
 * @return whether a given (at most) single-valued reference actually refers to something.
 */
export const isRef = <T>(ref?: SingleRef<T>): ref is T =>
    ref !== undefined && ref !== unresolved

/**
 * A type alias for a multi-valued reference, to make it look consistent with {@link SingleRef}.
 * Note: this type is primarily meant to be used to type nodes’ properties,
 * but should be avoided as a return type for “auxiliary” functions.
 */
export type MultiRef<T> = SingleRef<T>[]


/**
 * A type that expresses a value is either an {@link LionWebId} or a value to indicate that resolution to a node previously failed.
 */
export type IdOrUnresolved = LionWebId | typeof unresolved;


/**
 * @return the serialization of the given {@link SingleRef single reference target}, as a {@link LionWebId LionWeb ID}.
 */
export const serializedRef = <NT extends Node>(ref: SingleRef<NT>): LionWebId | typeof unresolved =>
    ref === unresolved ? unresolved : ref.id

