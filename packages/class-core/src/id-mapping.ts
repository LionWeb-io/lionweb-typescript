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

import { IdOrUnresolved, SingleRef, unresolved } from "@lionweb/core"
import { LionWebId } from "@lionweb/json"

import { INodeBase } from "./index.js"

type NodesById = { [id: LionWebId]: INodeBase }


/**
 * Maintains a mapping ID &rarr; node,
 * which is primarily used for efficiently applying {@link IDelta deltas}.
 * Instances are produced by the {@link nodeBaseDeserializerWithIdMapping} function.
 */
export class IdMapping {

    private nodesById: NodesById;
    constructor(nodesById: NodesById) {
        this.nodesById = {...nodesById};
    }
    // TODO  consider using an instance of Map<Id, INodeBase> instead

    /**
     * @return the {@link INodeBase node} with the given {@link LionWebId `id`}, or
     * @throws an Error if no node with the given ID was registered.
     */
    fromId = (id: LionWebId): INodeBase => {
        if (!(id in this.nodesById)) {
            throw new Error(`node with id=${id} not in ID mapping`);
        }
        return this.nodesById[id];
    }

    /**
     * @return the {@link INodeBase node} with the given {@link LionWebId `id`},
     * or `undefined` if no node with the given ID was registered.
     */
    tryFromId = (id: LionWebId): (INodeBase | undefined) =>
        this.nodesById[id];

    /**
     * @return the {@link INodeBase node} referenced from the given {@link LionWebId ID},
     * or `unresolved` if `unresolved` was passed in or no node with the given ID was registered.
     */
    fromRefId = (idOrUnresolved: IdOrUnresolved): SingleRef<INodeBase> =>
        idOrUnresolved === unresolved
            ? unresolved
            : (this.nodesById[idOrUnresolved] ?? unresolved);

    /**
     * Updates this {@link IdMapping} with the given `node` *and all its descendants* (recursively).
     */
    updateWith= (node: INodeBase) => {
        this.nodesById[node.id] = node;
        node.children   // recurse into all children
            .forEach((child) => this.updateWith(child));
    }

    /**
     * Re-initializes this {@link IdMapping ID mapping} with the given nodes-by-ID.
     * This completely removes all registrations of nodes,
     * and should only be used by components which are in complete control of the nodes being passed to this method.
     */
    reinitializeWith = (nodesById: NodesById) => {
        this.nodesById = nodesById
    }

}

