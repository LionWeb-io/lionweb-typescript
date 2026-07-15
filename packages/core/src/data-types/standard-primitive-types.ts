// Copyright 2026 TRUMPF Laser SE and other contributors
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
// SPDX-FileCopyrightText: 2026 TRUMPF Laser SE and other contributors
// SPDX-License-Identifier: Apache-2.0

const parsedAsBoolean = (value: string): boolean | undefined => {
    switch (value) {
        case "true":
            return true
        case "false":
            return false
        default:
            return undefined
    }
}

const parsedAsInteger = (value: string): number | undefined => {
    const int = Number(value)
    return Number.isInteger(int) ? int : undefined
}

/**
 * Standard serializers for boolean-, integer-, and string-typed values.
 */
export const standardSerializers = {
    string: (value: unknown) => value as string,
    boolean: (value: unknown) => `${value as boolean}`,
    integer: (value: unknown) => `${value as number}`
} as const

/**
 * Standard deserializers for boolean-, integer-, and string-typed values.
 */
export const standardDeserializers = {
    string: (value: string) => value,
    boolean: (value: string) => parsedAsBoolean(value),
    integer: (value: string) => parsedAsInteger(value)
} as const

