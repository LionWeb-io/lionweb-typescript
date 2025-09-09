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

import { IDelta } from "./base.js"
import { serializeDelta } from "./serialization/index.js"

/**
 * A type for functions that receive deltas.
 */
export type DeltaReceiver = (delta: IDelta) => void;

/**
 * Legacy alias for {@link DeltaReceiver}.
 */
export type DeltaHandler = (delta: IDelta) => void;

/**
 * @return a tuple consisting of a {@link DeltaReceiver} implementation (as 1st member) that pushes any received delta unto the tuple's 2nd member: an array of {@link IDelta deltas}.
 * @param printSerializations determines whether the deltas are serialized as JSON and printed to the JavaScript console.
 */
export const collectingDeltaReceiver = (printSerializations = false): [DeltaReceiver, IDelta[]] => {
    const deltas: IDelta[] = [];
    const receiveDelta: DeltaReceiver = (delta) => {
        deltas.push(delta);
        if (printSerializations) {
            console.log(JSON.stringify(serializeDelta(delta), null, 4));
        }
    };
    return [receiveDelta, deltas];
};

/**
 * Legacy alias for {@link collectingDeltaReceiver}.
 */
export const collectingDeltaHandler = collectingDeltaReceiver;

/**
 * An interface for {@link DeltaReceiver delta receivers} that can be switched on and off — “latchingDeltaReceiverFrom”.
 */
export interface LatchingDeltaReceiver extends DeltaReceiver {
    latch(emitDeltas: boolean): void;
}

/**
 * Legacy alias for {@link LatchingDeltaReceiver}.
 */
export interface LatchingDeltaHandler extends LatchingDeltaReceiver {};

/**
 * @return a latching version of the given {@link DeltaReceiver delta receiver}.
 */
export const latchingDeltaReceiverFrom = (receiveDelta: DeltaReceiver): LatchingDeltaReceiver => {
    let emitDeltas = false;
    return Object.assign(
        (delta: IDelta) => {
            if (emitDeltas) {
                receiveDelta(delta);
            }
        },
        {
            latch(emitDeltas_: boolean) {
                emitDeltas = emitDeltas_;
            },
        },
    );
};


/**
 * @return a {@link DeltaReceiver delta receiver} implementation that forwards received deltas to the given {@link DeltaReceiver delta receivers}.
 * This is necessary e.g. for combining using the delta protocol with an undo mechanism.
 */
export const deltaReceiverForwardingTo = (...deltaReceivers: DeltaReceiver[]): DeltaReceiver =>
    (delta) => {
        deltaReceivers.forEach((receiveDelta) => receiveDelta(delta));
    };

