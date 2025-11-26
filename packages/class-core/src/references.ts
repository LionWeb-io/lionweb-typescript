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

import { SingleRef, unresolved } from "@lionweb/core"
import { LionWebId } from "@lionweb/json"

import { INodeBase } from "./base-types.js"


/**
 * A type that expresses a value is either an {@link LionWebId} or a value to indicate that resolution to a node previously failed.
 */
export type IdOrUnresolved = LionWebId | typeof unresolved;


/**
 * @return the ID of a given reference to a {@link INodeBase}, or {@link unresolved} if that reference was previously unresolved.
 */
export const idFrom = (ref: SingleRef<INodeBase>): IdOrUnresolved =>
    ref === unresolved ? unresolved : ref.id

