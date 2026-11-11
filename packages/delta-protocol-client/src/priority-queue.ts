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

import { Procedure } from "@lionweb/delta-protocol-common"


/**
 * @return the index at which `t` should be inserted to keep the array `ts` sorted in the numeric order determined by applying `valueFunc` to its members.
 * In case `t` has the same numeric value as existing members of `ts`, the lowest index having that numeric value is returned.
 * (Exported for testing purposes only!)
 */
export const insertionIndex = <T>(ts: T[], valueFunc: (t: T) => number, tToInsert: T): number => {
    const valueToInsert = valueFunc(tToInsert)
    let low = 0
    let high = ts.length - 1

    while (low <= high) {
        const mid = low + ((high - low) >>> 1)  // not buggy! ;D
        const midValue = valueFunc(ts[mid])

        if (midValue < valueToInsert) {
            low = mid + 1
        } else if (valueToInsert < midValue) {
            high = mid - 1
        } else {
            return mid
        }
    }

    return low
}


/**
 * A class that implements a “priority queue”.
 * The {@link #accept} method takes a `t` and either processes it directly if `t` has the next expected priority,
 * or enqueues it for later processing.
 *
 * (Technically, this can be considered to be a modified {@link https://en.wikipedia.org/wiki/Priority_queue *“monotone priority queue”*}.)
 */
export class PriorityQueue<T> {
    private readonly ts: T[] = []
    private _nextExpectedPriority: number

    constructor(
        private readonly priorityFunc: (t: T) => number,
        firstPriority: number,
        private readonly process: Procedure<T>
    ) {
        this._nextExpectedPriority = firstPriority
    }

    get nextExpectedPriority(): number {
        return this._nextExpectedPriority
    }

    set nextExpectedPriority(value: number) {
        if (!Number.isInteger(value) || value <= this._nextExpectedPriority) {
            throw new Error(`next expected priority should be an integer larger than ${this._nextExpectedPriority}`)
        }
        this._nextExpectedPriority = value
    }

    /**
     * Accepts an item and either processes it directly if it has the next expected priority,
     * or enqueues it for later processing.
     * @throws an Error when an item is passed with a priority that has already been processed.
     */
    accept(t: T): void {
        const priority = this.priorityFunc(t)
        if (priority < this._nextExpectedPriority) {
            throw new Error(`priority ${priority} has already been processed; (next expected priority: ${this._nextExpectedPriority})`)
        }
        const index0 = insertionIndex(this.ts, this.priorityFunc, t)
        if (priority === this._nextExpectedPriority) {
            this._nextExpectedPriority++
            this.process(t)
            let index = index0
            let stop = false
            while (index < this.ts.length && !stop) {
                const currentT = this.ts[index]
                const currentPriority = this.priorityFunc(currentT)
                if (currentPriority === this._nextExpectedPriority) {
                    this._nextExpectedPriority++
                    this.process(currentT)
                    index++
                } else {
                    stop = true
                }
            }
            if (index > index0) {
                this.ts.splice(index0, index - index0)
            }
        } else {
            this.ts.splice(index0, 0, t)
        }
    }
}

