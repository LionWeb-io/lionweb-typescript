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
        `unresolved reference to target:` + stringifyPropertiesOf(this, "targetId", "resolveInfo")
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
export const isRef = <NT extends Node>(ref?: SingleRef<NT>): ref is NT =>
    ref !== undefined && !isReferenceToSet(ref) && !isUnresolvedReference(ref)

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
 * A type alias for a multi-valued reference, to make it look consistent with {@link SingleRef}.
 * Note: this type is primarily meant to be used to type nodes’ properties,
 * but should be avoided as a return type for “auxiliary” functions.
 */
export type MultiRef<NT extends Node> = SingleRef<NT>[]

