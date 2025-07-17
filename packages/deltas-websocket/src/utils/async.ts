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

import { clearInterval, setInterval } from "timers"


/**
 * A type for callback functions of the shape present in the WebSocket API.
 */
export type Callback = (error?: Error) => void

/**
 * A generic implementation of {@link Callback} that just throws a received {@link Error error}.
 */
export const throwingCallback: Callback = (error) => {
    if (error !== undefined) {
        throw error
    }
}


/**
 * @return the given procedure with callback, but wrapped properly as a {@link Promise}.
 */
export const wrappedAsPromise = (procedure: (callback: Callback) => void): Promise<void> =>
    new Promise<void>((resolve, reject) => {
        procedure(
            (optionalError) => {
                if (optionalError === undefined || optionalError === null) {    // also check for null, because that's what happens in real life
                    resolve()
                } else {
                    reject()
                }
            }
        )
    })


/**
 * @return a {@link Promise} that resolves after the given `conditionThunk` evaluates to `true`, checking every `ms` milliseconds.
 */
export const waitUntil = (ms: number, conditionThunk: () => boolean): Promise<void> => {
    return new Promise((resolve) => {
        const intervalID = setInterval(() => {
            if (conditionThunk()) {
                clearInterval(intervalID)
                resolve()
            }
        }, ms)
    })
}

