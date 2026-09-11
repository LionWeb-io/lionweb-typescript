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

import { isReferenceToSet, isUnresolvedReference, Node, Reference, SingleRef } from "@lionweb/core"
import { nodeBaseReader } from "@lionweb/class-core"

/**
 * @return a `resolveInfo` string for the given `ref` value of the given `reference`, or an attempt at that.
 * *Note*: for internal use only!
 */
export const resolveInfoFrom = <T extends Node>(ref: SingleRef<T>, reference: Reference): (string | null) =>
    (() => {
        if (isReferenceToSet(ref)) {
            return undefined
        }
        if (isUnresolvedReference(ref)) {
            return ref.resolveInfo
        }
        return nodeBaseReader.resolveInfoFor!(ref, reference)
    })() ?? null

