import { LionWebId } from "@lionweb/json"
import { stringifyPropertiesOf } from "@lionweb/ts-utils"

import { Node } from "./types.js"
import { INamed } from "./m3/index.js"


/**
 * The `unresolved` “symbol” indicates a reference value which hasn't been resolved yet.
 * It differs from an unset (`undefined`) value.
 * This value shouldn’t be manipulated/compared to directly!
 *
 * @deprecated Use {@link referenceToSet} or {@link UnresolvedReference} instead.
 */
export const unresolved = null


/**
 * Representation of an unresolved reference.
 * At most one of `targetId` or `resolveInfo` can be `undefined`.
 *
 * *Note* that this instance will **not** exhibit object equality,
 * i.e.: the resolved target of an unresolved reference will be a different object!
 */
export class UnresolvedReference {
    constructor(public readonly targetId?: LionWebId, public resolveInfo?: string) {}
    toString = () =>
        `unresolved reference to target: ` + stringifyPropertiesOf(this, "targetId", "resolveInfo")
}

/**
 * A singleton representing an unset reference that’s meant to be set,
 * distinguishing that from a reference that’s intentionally not set
 *  — which can only happen if that reference is (defined as) optional.
 */
export const referenceToSet = Symbol("<unset reference>")

/**
 * A type definition for a reference value that can be unresolved.
 * Note: this type is primarily meant to be used to type nodes’ properties,
 * but should be avoided as a return type for “auxiliary” functions.
 */
export type SingleRef<NT extends Node> = NT | UnresolvedReference | typeof referenceToSet

/**
 * @return whether the given {@link UnresolvedReference} corresponds to an (explicitly-)unset (yet-to-set) reference.
 */
export const isReferenceToSet = <T extends Node>(ref?: SingleRef<T>): ref is typeof referenceToSet =>
    ref === referenceToSet

/**
 * Type function for the {@link UnresolvedReference} type.
 */
export const isUnresolvedReference = <NT extends Node>(ref?: SingleRef<NT>): ref is UnresolvedReference =>
    ref instanceof UnresolvedReference

/**
 * @return whether a given (at most) single-valued reference actually refers to something.
 */
export const isResolvedReference = <NT extends Node>(ref?: SingleRef<NT>): ref is NT =>
    ref !== undefined && !isReferenceToSet(ref) && !isUnresolvedReference(ref)

/**
 * @return whether a given (at most) single-valued reference actually refers to something.
 *
 * This is the version of {@link isResolvedReference} with a too short name.
 * It will be deprecated and removed in later versions.
 */
export const isRef = isResolvedReference;

/**
 * @return either the referenced node’s name, or the `resolveInfo` if the reference is unresolved, or `undefined`.
 */
export const tryToRenderAsText = <T extends Node & INamed>(ref?: SingleRef<T>): string | undefined => {
    if (ref === undefined || isReferenceToSet(ref)) {
        return undefined
    }
    if (isUnresolvedReference(ref)) {
        return ref.resolveInfo
    }
    return ref.name
}

/**
 * @return either the referenced node,
 * or throws an appropriate {@link Error} if `ref` is `undefined`, (still) to-be-set, or unresolved.
 * @throws an appropriate {@link Error} if `ref` is `undefined`, (still) to-be-set, or unresolved.
 */
export const resolvedOrThrows = <T extends Node>(ref?: SingleRef<T>): T => {
    if (ref === undefined) {
        throw new Error(`reference is undefined`)
    }
    if (isReferenceToSet(ref)) {
        throw new Error(`reference is to-be-set`)
    }
    if (isUnresolvedReference(ref)) {
        throw new Error(ref.toString())
    }
    return ref
}


/**
 * @return the given `ref` if that’s a real reference (and not `undefined`, (still) to-be-set, or unresolved),
 * or the given `defaultValue` otherwise.
 * (The type of `ref` is a sum type, because `?`-arguments must appear last in the arguments’ list.)
 */
export const resolvedOrDefault = <DVT, NT extends Node>(ref: SingleRef<NT> | undefined, defaultValue: DVT) =>
    isResolvedReference(ref) ? ref : defaultValue

/**
 * @return either the referenced node,
 * or `undefined` if `ref` is `undefined`, (still) to-be-set, or unresolved.
 */
export const resolvedOrUndefined = <NT extends Node>(ref?: SingleRef<NT>): NT | undefined =>
    isResolvedReference(ref) ? ref : undefined

/**
 * @return either the referenced node,
 * or an empty list if `ref` is `undefined`, (still) to-be-set, or unresolved.
 * This is specifically useful for migrating to version 0.10.0 of this package
 * when “an Elvis chain” is continued with functions from {@link Array} such as `filter`, `map`, etc.
 */
export const resolvedOrEmptyList = <NT extends Node>(ref?: SingleRef<NT>): NT | [] =>
    isResolvedReference(ref) ? ref : []


/**
 * A type alias for a multi-valued reference, to make it look consistent with {@link SingleRef}.
 * Note: this type is primarily meant to be used to type nodes’ properties,
 * but should be avoided as a return type for “auxiliary” functions.
 */
export type MultiRef<NT extends Node> = SingleRef<NT>[]

