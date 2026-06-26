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

import { LionWebId, LionWebJsonDeltaChunk } from "@lionweb/json"
import { isValidIdentifier } from "@lionweb/core"

export interface Message {
    messageKind: string
}

/**
 * All messages containing a {@link LionWebJsonChunk serialization chunk}.
 *
 * (See § 3.7.1 of the specification of the delta protocol.)
 */
export interface SplittableMessage extends Message {
    split?: boolean
}

/**
 * (See § 3.7.2 of the specification of the delta protocol.)
 */
export interface AdditionalInfo {
    kind: LionWebId
    message: string
    data: Record<LionWebId, string>
}

export interface DeltaAdditionalInfo extends Message {
    additionalInfos: AdditionalInfo[]
}

/**
 * Continued chunks continue the chunk from the related splittable message.
 *
 * (See § 3.7.1 of the specification of the delta protocol.)
 */
export interface ContinuedChunkMessage extends Message {
    chunk: LionWebJsonDeltaChunk
    continuedChunkCompleted: boolean
    continuedChunkSequenceNumber: number
}


const customPrefix = "Custom_"

/**
 * Type def. for custom message kinds, meaning:
 *  - MUST adhere to the same format as identifiers,
 *  - MUST start with "Custom_", and
 *  - MUST have at least 8 characters.
 * (See §5.3.)
 *
 * *Note*: use the {@link isValidCustomMessageKind} to actually check correctness.
 */
export type CustomMessageKind = `Custom_${string}`
// Note: can’t use customPrefix constant in template literal type — see https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html

/**
 * @return Whether the given `messageKind` string is a valid message kind string.
 */
export const isValidCustomMessageKind = (messageKind: string): messageKind is CustomMessageKind =>
    isValidIdentifier(messageKind) && messageKind.startsWith(customPrefix) && (messageKind.length > customPrefix.length)

