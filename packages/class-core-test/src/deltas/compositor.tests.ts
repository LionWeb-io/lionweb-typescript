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

import { deepEqual,throws } from "../assertions.js"

import { CompositeDelta, DeltaCompositor, IDelta, NoOpDelta } from "@lionweb/class-core"


describe("delta compositor", () => {

    const testCompositor = (maximumNestingDepth: number = Infinity): [compositor: DeltaCompositor, deltas: IDelta[]] => {
        const deltas: IDelta[] = []
        const compositor = new DeltaCompositor((delta) => {
            deltas.push(delta)
        }, maximumNestingDepth)
        return [compositor, deltas]
    }

    it("throws on invalid maximum nesting depth", () => {
        const dummyDeltaReceiver = (_delta: IDelta) => {}
        throws(
            () => new DeltaCompositor(dummyDeltaReceiver, -1),
            `maximum nesting depth must be a non-negative integer`
        )
        throws(
            () => new DeltaCompositor(dummyDeltaReceiver, Math.PI),
            `maximum nesting depth must be a non-negative integer`
        )
        new DeltaCompositor(dummyDeltaReceiver, Infinity)    // no problem
    })

    it("forwards deltas when no composite is opened", () => {
        const [compositor, deltas] = testCompositor()
        const delta = new NoOpDelta()

        deepEqual(deltas, [])
        compositor.upstreamReceiveDelta(delta)
        deepEqual(deltas, [delta])
        compositor.upstreamReceiveDelta(delta)
        deepEqual(deltas, [delta, delta])
    })

    it("throws when opening too deeply-nested composites", () => {
        const [compositor0] = testCompositor(0)
        throws(
            () => {
                compositor0.openComposite()
            },
            `attempt occurred to start a nested composition exceeding the maximum nesting depth`
        )

        const [compositor1] = testCompositor(1)
        compositor1.openComposite()
        throws(
            () => {
                compositor1.openComposite()
            },
            `attempt occurred to start a nested composition exceeding the maximum nesting depth`
        )

        const [compositor2] = testCompositor(2)
        compositor2.openComposite()
        compositor2.openComposite()
        throws(
            () => {
                compositor2.openComposite()
            },
            `attempt occurred to start a nested composition exceeding the maximum nesting depth`
        )
    })

    it("throws when closing an unopened composite", () => {
        const [compositor] = testCompositor()
        throws(
            () => {
                compositor.closeComposite()
            },
            `attempt occurred to finish a composite without one being started`
        )
    })

    it("works for depth 1", () => {
        const [compositor, deltas] = testCompositor()
        const delta = new NoOpDelta()

        compositor.openComposite()
        compositor.upstreamReceiveDelta(delta)
        deepEqual(deltas, [])
        compositor.upstreamReceiveDelta(delta)
        deepEqual(deltas, [])
        compositor.closeComposite()
        deepEqual(deltas, [new CompositeDelta([delta, delta])])
    })

    it("works for depth 2", () => {
        const [compositor, deltas] = testCompositor()
        const delta = new NoOpDelta()

        compositor.openComposite()
        compositor.upstreamReceiveDelta(delta)
        deepEqual(deltas, [])
        compositor.openComposite()
        compositor.upstreamReceiveDelta(delta)
        deepEqual(deltas, [])
        compositor.closeComposite()
        deepEqual(deltas, [])
        compositor.upstreamReceiveDelta(delta)
        compositor.closeComposite()
        deepEqual(deltas, [new CompositeDelta([delta, new CompositeDelta([delta]), delta])])
    })

})

