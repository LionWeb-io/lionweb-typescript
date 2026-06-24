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

import { invertedMoveAndReplaceWithOffset, moveAndReplaceWithOffset, moveWithOffset } from "@lionweb/ts-utils"
import { invertedMoveWithOffset } from "@lionweb/ts-utils/dist/move-utils.js"
import { deepEqual, equal, throws } from "../test-utils/assertions.js"


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const runNegativeCheckIndicesUnitTests = (action: (ts: string[], oldIndex: number, indexOffset: number) => any) =>
    it("throws on invalid input", () => {
        throws(
            () => {
                action([], 1.3, 2.1)
            },
            /oldIndex is not an integer: \d+\.\d+/
        )
        throws(
            () => {
                action([], 3, 2.1)
            },
            /indexOffset is not an integer: \d+\.\d+/
        )
        throws(
            () => {
                action([], 1, 0)
            },
            /oldIndex is outside of array bounds: 1 > n - 1, with n = 0 = length of array/
        )
        throws(
            () => {
                action([], -1, 0)
            },
            /oldIndex is outside of array bounds: -1 < 0/
        )
        throws(
            () => {
                action(["a"], 0, 0)
            },
            /indexOffset can’t be 0 \(would make the operation idempotent\)/
        )
        throws(
            () => {
                action(["a", "b"], 0, 2)
            },
            /can’t move outside of array bounds: oldIndex \+ indexOffset = 2 > n - 1, with n = 2 = length of array/
        )
        throws(
            () => {
                action(["a", "b"], 1, -2)
            },
            /can’t move outside of array bounds: oldIndex \+ indexOffset = -1 < 0/
        )
    })
    // Note: the actual “semantical” tests also function as positive tests for checkIndices.


describe("moving an item (without replacing), with offset", () => {

    it("throws on invalid input", () => {
        runNegativeCheckIndicesUnitTests(moveWithOffset)
    })

    it("example 1 in doc: indexOffset > 0", () => {
        const list = ["A", "B", "C", "X", "D", "E", "F", "G"]
        deepEqual(moveWithOffset(list, 3, 2), [5, "X"])
        deepEqual(list, ["A", "B", "C", "D", "E", "X", "F", "G"])
    })

    it("example 2 in doc: indexOffset < 0", () => {
        const list = ["A", "B", "C", "D", "X", "E", "F", "G"]
        deepEqual(moveWithOffset(list, 4, -3), [1, "X"])
        deepEqual(list, ["A", "X", "B", "C", "D", "E", "F", "G"])
    })

    it("swap cases + at outsides of list", () => {
        const list = ["a", "b"]
        deepEqual(moveWithOffset(list, 1, -1), [0, "b"])
        deepEqual(list, ["b", "a"])

        deepEqual(moveWithOffset(list, 0, 1), [1, "b"])
        deepEqual(list, ["a", "b"])
    })

})

describe("inverting a move with offset", () => {

    it("example 1 in doc: indexOffset > 0", () => {
        const originalList = ["A", "B", "C", "X", "D", "E", "F", "G"]
        const list = originalList.slice()
        const oldIndex = 3
        const indexOffset = 2
        const [newIndex, movedItem] = moveWithOffset(list, oldIndex, indexOffset)
        equal(newIndex, 5)
        equal(movedItem, "X")
        equal(list[newIndex], movedItem)
        deepEqual(list, ["A", "B", "C", "D", "E", "X", "F", "G"])
        const [invertedOldIndex, invertedIndexOffset] = invertedMoveWithOffset(oldIndex, indexOffset)
        equal(invertedOldIndex, 5)
        equal(invertedIndexOffset, -2)
        deepEqual(moveWithOffset(list, invertedOldIndex, invertedIndexOffset), [3, "X"])
        deepEqual(list, originalList)
    })

    it("example 2 in doc: indexOffset > 0", () => {
        const originalList = ["A", "B", "C", "D", "X", "E", "F", "G"]
        const list = originalList.slice()
        const oldIndex = 4
        const indexOffset = -3
        const [newIndex, movedItem] = moveWithOffset(list, oldIndex, indexOffset)
        equal(newIndex, 1)
        equal(movedItem, "X")
        equal(list[newIndex], movedItem)
        deepEqual(list, ["A", "X", "B", "C", "D", "E", "F", "G"])
        const [invertedOldIndex, invertedIndexOffset] = invertedMoveWithOffset(oldIndex, indexOffset)
        equal(invertedOldIndex, 1)
        equal(invertedIndexOffset, 3)
        deepEqual(moveWithOffset(list, invertedOldIndex, invertedIndexOffset), [4, "X"])
        deepEqual(list, originalList)
    })

})


describe("moving an item and replacing another, with offset", () => {

    it("throws on invalid input", () => {
        runNegativeCheckIndicesUnitTests(moveAndReplaceWithOffset)
    })

    it("example 1 in doc: indexOffset > 0", () => {
        const list = ["A", "B", "C", "X", "D", "E", "F", "G"]
        deepEqual(moveAndReplaceWithOffset(list, 3, 3), [5, "X", "F"])
        deepEqual(list, ["A", "B", "C", "D", "E", "X", "G"])
    })

    it("example 2 in doc: indexOffset < 0", () => {
        const list = ["A", "B", "C", "D", "X", "E", "F"]
        deepEqual(moveAndReplaceWithOffset(list, 4, -3), [1, "X", "B"])
        deepEqual(list, ["A", "X", "C", "D", "E", "F"])
    })

    it("replace previous sibling + at outsides of list", () => {
        const list = ["a", "b"]
        deepEqual(moveAndReplaceWithOffset(list, 1, -1), [0, "b", "a"])
        deepEqual(list, ["b"])
    })

    it("replace next sibling + at outsides of list", () => {
        const list = ["a", "b"]
        deepEqual(moveAndReplaceWithOffset(list, 0, 1), [0, "a", "b"])
        deepEqual(list, ["a"])
    })

})

describe("inverting a move+replace with offset", () => {

    it("example 1 in doc: indexOffset > 0", () => {
        const originalList = ["A", "B", "C", "X", "D", "E", "F", "G"]
        const list = originalList.slice()
        const oldIndex = 3
        const indexOffset = 3
        deepEqual(moveAndReplaceWithOffset(list, oldIndex, indexOffset), [5, "X", "F"])
        deepEqual(list, ["A", "B", "C", "D", "E", "X", "G"])
        const [insertionIndex, invertedOldIndex, invertedIndexOffset] = invertedMoveAndReplaceWithOffset(oldIndex, indexOffset)
        equal(insertionIndex, 6)
        equal(invertedOldIndex, 5)
        equal(invertedIndexOffset, -2)
        list.splice(insertionIndex, 0, "F")
        deepEqual(list, ["A", "B", "C", "D", "E", "X", "F", "G"])
        deepEqual(moveWithOffset(list, invertedOldIndex, invertedIndexOffset), [3, "X"])
        deepEqual(list, originalList)
    })

    it("example 2 in doc: indexOffset < 0", () => {
        const originalList = ["A", "B", "C", "D", "X", "E", "F"]
        const list = originalList.slice()
        const oldIndex = 4
        const indexOffset = -3
        deepEqual(moveAndReplaceWithOffset(list, oldIndex, indexOffset), [1, "X", "B"])
        deepEqual(list, ["A", "X", "C", "D", "E", "F"])
        const [insertionIndex, invertedOldIndex, invertedIndexOffset] = invertedMoveAndReplaceWithOffset(oldIndex, indexOffset)
        equal(insertionIndex, 1)
        equal(invertedOldIndex, 2)
        equal(invertedIndexOffset, 2)
        list.splice(insertionIndex, 0, "B")
        deepEqual(list, ["A", "B", "X", "C", "D", "E", "F"])
        deepEqual(moveWithOffset(list, invertedOldIndex, invertedIndexOffset), [4, "X"])
        deepEqual(list, originalList)
    })

    it("replace previous sibling + at outsides of list", () => {
        const originalList = ["a", "b"]
        const list = originalList.slice()
        const oldIndex = 1
        const indexOffset = -1
        deepEqual(moveAndReplaceWithOffset(list, oldIndex, indexOffset), [0, "b", "a"])
        deepEqual(list, ["b"])
        const [insertionIndex, invertedOldIndex, invertedIndexOffset] = invertedMoveAndReplaceWithOffset(oldIndex, indexOffset)
        equal(insertionIndex, 0)
        equal(invertedOldIndex, 1)
        equal(invertedIndexOffset, 0)
        list.splice(insertionIndex, 0, "a")
        deepEqual(list, ["a", "b"])
    })

    it("replace next sibling + at outsides of list", () => {
        const originalList = ["a", "b"]
        const list = originalList.slice()
        const oldIndex = 0
        const indexOffset = 1
        deepEqual(moveAndReplaceWithOffset(list, oldIndex, indexOffset), [0, "a", "b"])
        deepEqual(list, ["a"])
        const [insertionIndex, invertedOldIndex, invertedIndexOffset] = invertedMoveAndReplaceWithOffset(oldIndex, indexOffset)
        equal(insertionIndex, 1)
        equal(invertedOldIndex, 0)
        equal(invertedIndexOffset, 0)
        list.splice(insertionIndex, 0, "b")
        deepEqual(list, ["a", "b"])
    })

})

