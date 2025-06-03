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

import { Link } from "@lionweb/core"
import { LionWebId } from "@lionweb/json"
import { INodeBase } from "./index.js"


/**
 * A tuple type for (data concerning) link and annotation values that are involved with deserialization and deep-duplication
 *  — more specifically: nodes that have to be installed on other (deserialized/deep-duplicated) nodes in specific features (or as annotations).
 *
 * The elements are:
 *
 * 1. `parent` — the {@link INodeBase} instance to install on.
 * 2. `feature` — the {@link Link link} feature to install on, or `null` to indicate that it's an annotation.
 * 3. `nodesIds` — are the IDs of the nodes to install.
 * 4. *optional* `originalReferenceTargets` — are the original reference targets of a {@link Reference reference} feature.
 *  This element is only present when the feature is a {@link Reference reference} feature.
 *  The `nodesIds` and `originalReferenceTargets` match up per index.
 *
 * Note: **DON'T** export this types from the package,
 * as these are only used to align the deserializer and deep-cloner.
 */
export type NodesToInstall = [ container: INodeBase, feature: Link | null, nodesIds: LionWebId[], originalReferenceTargets?: INodeBase[] ];

