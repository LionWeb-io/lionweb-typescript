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

import { DeltaHandler, latching, NoOpDelta } from "@lionweb/class-core"
import { equal } from "./assertions.js"

describe("deltas", () => {
    it("latching delta handler", () => {
        let counter = 0
        const countingDeltaHandler: DeltaHandler = _ => {
            counter++
        }
        const latchingDeltaHandler = latching(countingDeltaHandler)
        const dummyDelta = new NoOpDelta()
        latchingDeltaHandler(dummyDelta)
        latchingDeltaHandler(dummyDelta)
        equal(counter, 0)
        latchingDeltaHandler.latch(true)
        equal(counter, 0)
        latchingDeltaHandler(dummyDelta)
        equal(counter, 1)
        latchingDeltaHandler(dummyDelta)
        latchingDeltaHandler(dummyDelta)
        latchingDeltaHandler(dummyDelta)
        equal(counter, 4)
        latchingDeltaHandler.latch(false)
        latchingDeltaHandler(dummyDelta)
        equal(counter, 4)
    })
})

