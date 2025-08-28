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

import { CompositeDelta, DeltaHandler, IDelta } from "../index.js"


/**
 * A <em>delta compositor</em> is used to <em>aggregate</em> deltas as {@link CompositeDelta composite deltas}.
 *
 * Usage:
 * ```typescript
 * const compositor = new Compositor(downstreamHandleDelta);
 * compositor.openComposite();
 * // ...
 * compositor.upstreamHandleDelta(<delta>);
 * // ...
 * compositor.closeComposite();
 * ```
 */
export class DeltaCompositor {

    /**
     * The {@link DeltaHandler} implementation that either forwards to the given downstream delta handle
     * or gathers deltas into composite deltas to forward to the downstream delta handler later.
     */
    readonly upstreamHandleDelta: DeltaHandler;

    /**
     * An array of arrays of {@link IDelta deltas}, comprising a “stack”.
     *
     * Invariants:
     *  - (I1) composite has been opened &hArr; `this.deltasInComposite !== undefined` / `Array.isArray(this.deltasInComposite)`
     *  - (I2) this.deltasStack is either undefined or an array containing at least one array
     */
    private deltasStack: IDelta[][] | undefined = undefined;

    /**
     * @param downstreamHandleDelta the {@link DeltaHandler} that deltas get passed to.
     * @param maximumNestingDepth the maximum depth that composites can be nested.
     *  A maximum depth of e.g. 1 means that at most 1 composite can be open at any time.
     */
    constructor(private readonly downstreamHandleDelta: DeltaHandler, private readonly maximumNestingDepth: number = Infinity) {
        if (maximumNestingDepth !== Infinity && (!Number.isInteger(maximumNestingDepth) || maximumNestingDepth < 0)) {
            throw new Error(`maximum nesting depth must be a non-negative integer`);
        }
        this.upstreamHandleDelta = (delta) => {
            if (this.deltasStack === undefined) {
                // pass on immediately:
                this.downstreamHandleDelta(delta);
            } else {
                // store for later:
                this.deltasStack[this.deltasStack.length - 1].push(delta);  // (I2)
            }
        };
    }

    /**
     * Opens a composite, meaning that all deltas passed to the {@link upstreamHandleDelta} are gathered into a composite delta
     * that gets forwarded to the downstream delta handler as soon as the composite is closed.
     *
     * Composites can be nested, to the maximum depth configured through this class’ constructor,
     * beyond which an error gets thrown.
     */
    openComposite = (): void => {
        if (this.deltasStack === undefined) {
            this.deltasStack = [];  // ==> (I1) + 1st half of (I2)
        }
        if (this.deltasStack.length >= this.maximumNestingDepth) {
            throw new Error(`attempt occurred to start a nested composition exceeding the maximum nesting depth`)
        }
        this.deltasStack.push([]);  // ==> 2nd half of (I2)
    }

    /**
     * Closes the current composite, producing the deltas gathered for this composite into a composite delta.
     * Composites can be nested, and deltas only get forwarded to the downstream delta handler after the top-level composite has been closed.
     */
    closeComposite = (): void => {
        if (this.deltasStack === undefined) {
            throw new Error(`attempt occurred to finish a composite without one being started`);
        }

        const parts = this.deltasStack.pop()!;  // is an array because of (I2)
        if (this.deltasStack.length === 0) {    // last array popped from stack
            this.deltasStack = undefined;   // maintain (I2)
        }
        if (parts.length > 0) {
            this.upstreamHandleDelta(new CompositeDelta(parts));
        }
    }

}

