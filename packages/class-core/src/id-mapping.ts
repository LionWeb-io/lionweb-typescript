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

import {  IdOrUnresolved, SingleRef, unresolved } from "@lionweb/core"
import { LionWebId } from "@lionweb/json"

import { INodeBase } from "./index.js"

type NodesById = { [id: LionWebId]: INodeBase }


/**
 * Maintains a mapping ID &rarr; node,
 * which is primarily used for efficiently applying {@link IDelta deltas}.
 * Instances are produced by the {@link nodeBaseDeserializerWithIdMapping} function.
 */
export class IdMapping {

    nodesById: NodesById;
    constructor(nodesById: NodesById) {
        this.nodesById = {...nodesById};
    }

    fromId(id: LionWebId): INodeBase {
        if (!(id in this.nodesById)) {
            throw new Error(`node with id=${id} not in ID mapping`);
        }
        return this.nodesById[id];
    }

    fromRefId(idOrUnresolved: IdOrUnresolved): SingleRef<INodeBase> {
        return idOrUnresolved === null
            ? null
            : (this.nodesById[idOrUnresolved] ?? unresolved);
    }

    updateWith(node: INodeBase) {
        this.nodesById[node.id] = node;
        node.children   // recurse into all children
            .forEach((child) => this.updateWith(child));
    }

}

