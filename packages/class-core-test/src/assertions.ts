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

import { IDelta } from "@lionweb/class-core"

import { assert } from "chai"
export const { deepEqual, equal, fail, notEqual, sameMembers, throws } = assert


export const isFalse = (value: unknown, message?: string): void =>
    assert.isFalse(value, message);

export const isTrue = (value: unknown, message?: string): void =>
    assert.isTrue(value, message);

export const isUndefined = (value: unknown, message?: string): void =>
    assert.isUndefined(value, message);


/**
 * @return a `assertDeltaEmitted` function that asserts that one delta has been emitted since the previous call to `assertDeltaEmitted`,
 * or since the call to `emittedDeltaAsserter` if there’s no previous call, and that it deep-equals the given `expectedDelta`.
 */
export const emittedDeltaAsserter = (deltas: IDelta[]) => {
    let numberOfExpectedDeltas = deltas.length;
    return (expectedDelta: IDelta) => {
        equal(deltas.length, ++numberOfExpectedDeltas, `number of expected deltas`);
        deepEqual(deltas[numberOfExpectedDeltas - 1], expectedDelta);
    }
}

