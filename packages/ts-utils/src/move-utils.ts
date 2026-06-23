// Copyright 2026 TRUMPF Laser SE and other contributors
//
// Licensed under the Apache License, Version 2.0 (the "License")
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-FileCopyrightText: 2026 TRUMPF Laser SE and other contributors
// SPDX-License-Identifier: Apache-2.0


/**
 * Checks the given `oldIndex` and `indexOffset` against a given `length` of an array,
 * and throws if that move[+replace] is invalid.
 */
const checkIndices = (oldIndex: number, indexOffset: number, length: number) => {
    if (!Number.isInteger(oldIndex)) {
        throw new Error(`oldIndex is not an integer: ${oldIndex}`)
    }
    if (!Number.isInteger(indexOffset)) {
        throw new Error(`indexOffset is not an integer: ${indexOffset}`)
    }

    if (oldIndex < 0 || oldIndex > length - 1) {
        throw new Error(`oldIndex is outside of array bounds: ${oldIndex} ${oldIndex < 0 ? `< 0` : `> n - 1, with n = ${length} = length of array`}`)
    }
    const newIndex = oldIndex + indexOffset
    if (newIndex < 0 || newIndex > length - 1) {
        throw new Error(`can’t move outside of array bounds: oldIndex + indexOffset = ${newIndex} ${newIndex < 0 ? `< 0` : `> n - 1, with n = ${length} = length of array`}`)
    }
    if (indexOffset === 0) {
        throw new Error(`indexOffset can’t be 0 (would make the operation idempotent)`)
    }
}


/**
 * Moves the item in `ts` at index `oldIndex` over `indexOffset` places.
 * @returns A tuple consisting of the new index of the moved item, and the moved item.
 * @throws if the indices given are invalid.
 */
export const moveWithOffset = <T>(ts: T[], oldIndex: number, indexOffset: number): [newIndex: number, movedItem: T] => {
    checkIndices(oldIndex, indexOffset, ts.length)
    const newIndex = oldIndex + indexOffset
    const movedItem = ts[oldIndex]
    ts.splice(oldIndex, 1)
    ts.splice(newIndex, 0, movedItem)
    return [newIndex, movedItem]
}

/**
 * @return A description of the **inversion** of the move-action with given `oldIndex` and `indexOffset`,
 * consisting of a tuple (`invertedOldIndex`, `invertedIndexOffset`),
 * which are the 2nd and 3rd arguments passed to {@link moveWithOffset},
 * together with the `list` being manipulated (as the 1st argument).
 *
 * The following always holds:
 * ```
 * const originalList = [...]
 * const list = originalList.slice()
 * const [newIndex, movedItem] = moveWithOffset(list, oldIndex, indexOffset)
 * equal(list[newIndex], movedItem)
 * const [invertedOldIndex, invertedIndexOffset] = invertedMoveWithOffset(oldIndex, indexOffset)
 * deepEqual([oldIndex, movedItem], moveWithOffset(list, invertedOldIndex, invertedIndexOffset))
 * deepEqual(originalList, list)
 * ```
 */
export const invertedMoveWithOffset = (oldIndex: number, indexOffset: number): [invertedOldIndex: number, invertedIndexOffset: number] =>
    [oldIndex + indexOffset, -indexOffset]


/**
 * Moves the item in `ts` at index `oldIndex` over `indexOffset` places, replacing the item already present there.
 * @returns A tuple of the new index of the moved item, the moved item, and the replaced item.
 * @throws if the indices given are invalid.
 */
export const moveAndReplaceWithOffset = <T>(ts: T[], oldIndex: number, indexOffset: number): [newIndex: number, movedItem: T, replacedItem: T] => {
    checkIndices(oldIndex, indexOffset, ts.length)
    const targetIndex = oldIndex + indexOffset
    const movedItem = ts[oldIndex]
    const [replacedItem] = ts.splice(targetIndex, 1, movedItem)
    ts.splice(oldIndex, 1)
    return [targetIndex - (indexOffset > 0 ? 1 : 0), movedItem, replacedItem]
}

/**
 * @return A description of the **inversion** of the move and replace-action with given `oldIndex` and `indexOffset`,
 * consisting of a tuple (`insertionIndex`, `invertedOldIndex`, `invertedIndexOffset`):
 *
 * * `insertionIndex` is the index at which to insert the `replacedItem` again;
 * * (`invertedOldIndex`, `invertedIndexOffset`) (2nd and 3rd items) are the arguments
 *  that should be passed to {@link moveWithOffset},
 *  together with the `list` being manipulated (as the 1st argument).
 *
 * *Note* that the insertion should be executed *first*!
 * Also, *note* that if `indexOffset` is either 1 or -1,
 * then `invertedIndexOffset` is 0,
 * and the `moveWithOffset` should *not* be executed!
 * (The move and replace-action with `indexOffset` 1, resp. -1 is equivalent deletion of the next, resp. previous sibling.
 *  So, the insertion should always be executed.)
 *
 * The following always holds:
 * ```
 * const originalList = [...]
 * const list = originalList.slice()
 * const [newIndex, movedItem, replacedItem] = moveAndReplaceWithOffset(oldIndex, indexOffset)
 * equal(list[newIndex], movedItem)
 * const [insertionIndex, invertedOldIndex, invertedIndexOffset] = invertedMoveAndReplaceWithOffset(oldIndex, indexOffset)
 * list.splice(insertionIndex, 0, replacedItem)
 * deepEqual([oldIndex, movedItem], moveWithOffset(list, invertedOldIndex, invertedIndexOffset))
 * deepEqual(originalList, list)
 * ```
 */
export const invertedMoveAndReplaceWithOffset = (oldIndex: number, indexOffset: number): [insertionIndex: number, invertedOldIndex: number, invertedIndexOffset: number] => {
    const targetIndex = oldIndex + indexOffset
    return [targetIndex, targetIndex + (indexOffset > 0 ? -1 : 1), -indexOffset + (indexOffset > 0 ? 1 : -1)]
}

