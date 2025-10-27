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

import { prettyPrintedMs } from "../../test-utils/time.js"


describe("time convenience", () => {

    it("prettyPrintedMs", () => {
        const assert = (ms: number, expected: string) => {
            expect(prettyPrintedMs(ms)).to.equal(expected, expected)
        }
        assert(1, "1ms")
        assert(500, "500ms")
        assert(1000, "1s0ms")
        assert(1500, "1s500ms")
        assert(42000, "42s0ms")
        assert(42001, "42s1ms")
        assert(1 + 1000 * (2 + 60 * (3 + 60 * (4 + 24 * (5 + 365 * 6)))), "5y4h3m2s1ms")
        assert(1 << 25, "9h19m14s432ms")
        assert(1 << 30, "12y10h15m41s824ms")
    })

})

