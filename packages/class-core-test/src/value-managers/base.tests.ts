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

import { checkIndex } from "@lionweb/class-core"

import { throws } from "../assertions.js"

describe("checkIndex", () => {
    const throwsOn = (message: string, index: number, nElements: number, insert: boolean) => {
        throws(() => {
            checkIndex(index, nElements, insert)
        }, message)
    }

    it("throws on non-integers", () => {
        throwsOn(`an array index must be an integer, but got: 3.141592653589793`, Math.PI, 0, false)
        throwsOn(`an array index must be an integer, but got: Infinity`, Infinity, 0, false)
        throwsOn(`an array index must be an integer, but got: NaN`, NaN, 0, false)
    })

    it("throws on negative integers", () => {
        throwsOn(`an array index must be a non-negative integer, but got: -1`, -1, 0, false)
    })

    it("works correctly for empty arrays", () => {
        throwsOn(`an empty array has no valid indices (got: 0)`, 0, 0, false)
        throwsOn(`an empty array has no valid indices (got: 1)`, 1, 0, false)
        checkIndex(0, 0, true)
        throwsOn(`the largest valid insert index for an array with 0 elements is 0, but got: 1`, 1, 0, true)
    })

    it("works correctly for arrays of length 1", () => {
        checkIndex(0, 1, false)
        throwsOn(`the largest valid index for an array with 1 element is 0, but got: 1`, 1, 1, false)
        checkIndex(0, 1, true)
        checkIndex(1, 1, true)
        throwsOn(`the largest valid insert index for an array with 1 element is 1, but got: 2`, 2, 1, true)
    })

    it("works correctly for arrays of length 2", () => {
        checkIndex(0, 2, false)
        checkIndex(1, 2, false)
        throwsOn(`the largest valid index for an array with 2 elements is 1, but got: 2`, 2, 2, false)
        checkIndex(0, 2, true)
        checkIndex(1, 2, true)
        checkIndex(2, 2, true)
        throwsOn(`the largest valid insert index for an array with 2 elements is 2, but got: 3`, 3, 2, true)
    })
})

