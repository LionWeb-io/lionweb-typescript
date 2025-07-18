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

/**
 * Prints the key-value pairs in the given record to the console in a readable way.
 * You can use it as follows to conveniently print debug info:
 *
 * `println({ localVar1, localVar2, ... })`
 *
 * (This is meant for debugging convenience only!)
 */
export const println = (values: { [key: string]: unknown }) => {
    console.log(
        Object.entries(values)
            .map(([key, value]) => `${key}=${value}`)
            .join("  ")
    )
}

