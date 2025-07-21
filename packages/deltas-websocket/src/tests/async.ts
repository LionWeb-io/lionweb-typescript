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

import { fail } from "assert"
import { expect } from "chai"

/**
 * @return a {@link Promise} that resolves to the given `value` after `ms` milliseconds have elapsed.
 * *Note*: this function should only be used in test code, not in production code.
 */
export const delayed = <T>(ms: number, value: T): Promise<T> =>
    new Promise<T>((resolve) => {
        setTimeout(
            () => {
                resolve(value)
            },
            ms
        )}
    )


/**
 * @return a {@link Promise} that asserts that the {@link Promise} returned by the given `action` “thunk”
 * rejects with an {@link Error} with the `expectedErrorMessage` as its message.
 * **Note**: make sure to `return` the {@link Promise} returned by this function from an asynchronous Mocha test.
 * Code example:
 * <pre>
 *     describe("my Mocha test suite", async function() {
 *         it("my Mocha unit test", async function() {
 *           return expectedError(() => Promise.reject(new Error("foo")), "foo")
 *         })
 *     })
 * </pre>
 */
export const expectError = <T>(action: () => Promise<T>, expectedErrorMessage: string) =>
    action()
        .then(() => fail("expected an error"))
        .catch((error) => {
            expect(error instanceof Error).to.equal(true)
            expect((error as Error).message).to.equal(expectedErrorMessage)
        })

