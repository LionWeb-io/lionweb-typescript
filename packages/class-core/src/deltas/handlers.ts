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
 * A type for functions that handle deltas.
 */
export type DeltaHandler = (delta: IDelta) => void;

export const collectingDeltaHandler = (printSerializations = false): [DeltaHandler, IDelta[]] => {
    const deltas: IDelta[] = [];
    const handleDelta: DeltaHandler = (delta) => {
        deltas.push(delta);
        if (printSerializations) {
            console.log(JSON.stringify(serializeDelta(delta), null, 4));
        }
    };
    return [handleDelta, deltas];
};


/**
 * An interface for {@link DeltaHandler delta handlers} that can be switched on and off — “latching”.
 */
export interface LatchingDeltaHandler extends DeltaHandler {
    latch(emitDeltas: boolean): void;
}

/**
 * @return a latching version of the given {@link DeltaHandler delta handler}.
 */
export const latching = (handleDelta: DeltaHandler): LatchingDeltaHandler => {
    let emitDeltas = false;
    return Object.assign(
        (delta: IDelta) => {
            if (emitDeltas) {
                handleDelta(delta);
            }
        },
        {
            latch(emitDeltas_: boolean) {
                emitDeltas = emitDeltas_;
            },
        },
    );
};

