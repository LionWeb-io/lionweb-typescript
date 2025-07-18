// Copyright 2025 TRUMPF Laser SE and other contributors
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
// SPDX-FileCopyrightText: 2025 TRUMPF Laser SE and other contributors
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"

import { insertionIndex, priorityQueueAcceptor } from "../utils/priority-queue.js"


describe("insertionIndex", () => {

    const case_ = (nums: number[], numToInsert: number, expected: number) => {
        expect(insertionIndex(nums, (num) => num, numToInsert)).to.equal(expected)
    }

    it("inserts @0 on an empty array", () => {
        case_([], 1, 0)
    })

    it("works as expected", () => {
        case_([0], 1, 1)
        case_([0, 2], 1, 1)
        case_([0, 2], 3, 2)
    })

    it("also works as expected when inserting an already-present item", () => {
        case_([1], 1, 0)
        case_([1, 2], 2, 1)
        case_([1, 2, 3], 3, 2)
        case_([1, 2, 3, 4], 3, 2)
    })

})


describe("priority queue", () => {

    const priorityEnqueueFixture = () => {
        const processed: number[] = []
        const accept = priorityQueueAcceptor<number>((num) => num, 1, (num) => {
            processed.push(num)
        })
        return {
            accept,
            get processed() {
                return processed
            },
            offerAndAssert: (num: number, expectedProcessed: number[]) => {
                accept(num)
                expect(processed).to.deep.equal(expectedProcessed)
            }
        }
    }

    it("throws on invalid sequence numbers", () => {
        const {accept} = priorityEnqueueFixture()
        accept(1)
        expect(() => accept(1)).to.throw("priority 1 has already been processed; (next expected priority: 2)")
    })

    it("processes 1 item with next expected sequence number directly", () => {
        const {offerAndAssert} = priorityEnqueueFixture()
        offerAndAssert(1, [1])
    })

    it("processes 2 out-of-order items correctly", () => {
        const {offerAndAssert} = priorityEnqueueFixture()
        offerAndAssert(2, [])   // (1 not processed yet)
        offerAndAssert(1, [1, 2])
    })

    it("processes a “follow-up” of length 1 of a previous “run” directly", () => {
        const {offerAndAssert} = priorityEnqueueFixture()
        offerAndAssert(3, [])
        offerAndAssert(2, [])
        offerAndAssert(1, [1,2,3])
        offerAndAssert(4, [1,2,3,4])
    })

    it("processes a “follow-up” of length 2 of a previous “run” directly", () => {
        const {offerAndAssert} = priorityEnqueueFixture()
        offerAndAssert(3, [])
        offerAndAssert(5, [])
        offerAndAssert(2, [])
        offerAndAssert(1, [1,2,3])
        offerAndAssert(4, [1,2,3,4,5])
    })

    const headStreakLengthOf = (nums: number[]): number => {
        let i = 0
        while (i < nums.length && nums[i] === i+1) {
            i++
        }
        return i
    }

    it("headStreakLengthOf (internal function for fuzz testing)", () => {
        const case_ = (nums: number[], expected: number) => {
            expect(headStreakLengthOf(nums)).to.equal(expected)
        }
        case_([], 0)
        case_([1], 1)
        case_([2], 0)
        case_([1,2,3,4,5], 5);
        case_([1,2,3,4,5,7], 5);
    })

    it("fuzzing", () => {
        const {accept, processed} = priorityEnqueueFixture()

        const max = 1000
        const offered: number[] = []

        const newOffer = () => {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const streak = headStreakLengthOf(offered)
                const newPrio = Math.floor(Math.random() * 10_000)
                const newIndex = insertionIndex(offered, (num) => num, newPrio)
                if ((newIndex >= offered.length || offered[newIndex] !== newPrio) && newPrio > streak) {
                    offered.splice(newIndex, 0, newPrio)
                    return newPrio
                }
            }
        }

        while (offered.length < max) {
            accept(newOffer())
        }

        expect(processed).to.deep.equal(new Array(headStreakLengthOf(offered)).map((_, index) => index))
    })

})

