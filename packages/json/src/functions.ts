import { LionWebJsonMetaPointer, LionWebJsonReferenceTarget } from "./types.js"

/**
 * Tests whether all the properties of the two meta pointers are identical.
 * @param p1
 * @param p2
 */
export function isEqualMetaPointer(p1: LionWebJsonMetaPointer, p2: LionWebJsonMetaPointer): boolean {
    return p1.key === p2.key && p1.version === p2.version && p1.language === p2.language
}

/**
 * Tests whether all the properties of the two JSON objects are identical.
 * @param first
 * @param second
 */
export function isEqualReferenceTarget(first: LionWebJsonReferenceTarget, second: LionWebJsonReferenceTarget): boolean {
    return first.reference === second.reference && first.resolveInfo === second.resolveInfo
}

