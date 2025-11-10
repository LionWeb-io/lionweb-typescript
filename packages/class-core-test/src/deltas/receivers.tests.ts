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

import { DeltaReceiver, latchingDeltaReceiverFrom, NoOpDelta } from "@lionweb/class-core"

import { equal } from "../assertions.js"

describe("receivers", () => {

    it("latchingDeltaReceiverFrom delta receiver", () => {
        let counter = 0
        const countingDeltaReceiver: DeltaReceiver = _ => {
            counter++
        }
        const latchingDeltaReceiver = latchingDeltaReceiverFrom(countingDeltaReceiver)
        const dummyDelta = new NoOpDelta()
        latchingDeltaReceiver(dummyDelta)
        latchingDeltaReceiver(dummyDelta)
        equal(counter, 0)
        latchingDeltaReceiver.latch(true)
        equal(counter, 0)
        latchingDeltaReceiver(dummyDelta)
        equal(counter, 1)
        latchingDeltaReceiver(dummyDelta)
        latchingDeltaReceiver(dummyDelta)
        latchingDeltaReceiver(dummyDelta)
        equal(counter, 4)
        latchingDeltaReceiver.latch(false)
        latchingDeltaReceiver(dummyDelta)
        equal(counter, 4)
    })

})

