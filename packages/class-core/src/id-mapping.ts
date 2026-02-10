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

import { Node, referenceToSet, SingleRef } from "@lionweb/core"
import { LionWebId } from "@lionweb/json"

import { INodeBase, NodeBase } from "./base-types.js"
import { IdOrNull } from "./references.js"


/**
 * Type def. for a (hash-)map {@link LionWebId ID} &rarr; {@link Node}.
 */
type NodesById = { [id: LionWebId]: Node }


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
    // TODO  consider using an instance of Map<Id, Node> instead

    /**
     * @return the {@link Node node} with the given {@link LionWebId `id`}, or
     * @throws an Error if no node with the given ID was registered.
     */
    fromId = (id: LionWebId): Node => {
        if (!(id in this.nodesById)) {
            throw new Error(`node with id=${id} not in ID mapping`);
        }
        return this.nodesById[id];
    }

    /**
     * @return the {@link INodeBase node} with the given {@link LionWebId `id`}, or
     * @throws an Error if no node with the given ID was registered, or
     * if the node is not a {@link INodeBase}.
     */
    nodeBaseFromId = (id: LionWebId): INodeBase => {
        const node = this.fromId(id);
        if (node instanceof NodeBase) {
            return node;
        }
        throw new Error(`node with id=${id} is not a[n I]NodeBase`)
    }

    /**
     * @return the {@link Node node} with the given {@link LionWebId `id`},
     * or `undefined` if no node with the given ID was registered.
     */
    tryFromId = (id: LionWebId): (Node | undefined) =>
        this.nodesById[id];

    /**
     * @return the {@link Node node} referenced from the given {@link LionWebId ID},
     * or `unresolved` if `unresolved` was passed in or no node with the given ID was registered.
     */
    fromRefId = (idOrNull: IdOrNull): SingleRef<Node> =>
        idOrNull === null
            ? referenceToSet()
            : (this.nodesById[idOrNull] ?? referenceToSet());

    /**
     * Updates this {@link IdMapping} with the given `node` *and all its descendants* (recursively).
     */
    updateWith = (node: Node) => {
        this.nodesById[node.id] = node;
        if (node instanceof NodeBase) {
            node.children   // recurse into all children
                .forEach((child) => this.updateWith(child));
        }
        // TODO  figure out when it's really necessary to call this, as it's potentially *very* expensive
    }

    /**
     * Re-initializes this {@link IdMapping ID mapping} with the given nodes-by-ID.
     * This completely removes all registrations of nodes,
     * and should only be used by components which are in complete control of the nodes being passed to this method.
     */
    reinitializeWith = (nodesById: NodesById) => {
        this.nodesById = nodesById;
    }

    /**
     * Merges the given `that` {@link IdMapping} **in**to `this`,
     * overwriting any previous mappings in `this`.
     */
    mergeIn = (that: IdMapping) => {
        for (const id in that.nodesById) {
            this.nodesById[id] = that.nodesById[id];
        }
    }

}

