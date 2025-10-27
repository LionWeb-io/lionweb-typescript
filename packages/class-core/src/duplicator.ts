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

import { Containment, Feature, idOf, Link, Property, Reference, SingleRef, unresolved } from "@lionweb/core"
import { LionWebId } from "@lionweb/json"
import { asArray } from "@lionweb/ts-utils"

import { INodeBase } from "./base-types.js"
import { allNodesFrom } from "./convenience.js"
import { NodesToInstall } from "./linking.js"
import { getFeatureValue } from "./serializer.js"


/**
 * Type definition for functions that duplicate a node.
 */
export type NodeDuplicator = (originalNode: INodeBase) => [duplicatedNode: INodeBase, featuresToDuplicate: Feature[]];

/**
 * Type definition for functions that duplicate the (variadically) given nodes.
 */
export type Duplicator = (...nodes: INodeBase[]) => INodeBase[];

/**
 * @return a function that deep-duplicates a given forest of {@link INodeBase nodes}.
 * The result is an array of the deep-duplicated versions of the given nodes *in the same order*.
 *
 *  @param duplicateNode a function that returns a – possibly transformed – duplicate of the passed `originalNode`.
 * ***Note***: it's assumed that the classifiers of the original and duplicated nodes coincide exactly!
 */
export const deepDuplicateWith = (duplicateNode: NodeDuplicator): Duplicator =>
    (...nodes) => {

        const nodesToInstall: NodesToInstall[] = [];

        const visit = (node: INodeBase): [id: LionWebId, duplicatedNode: INodeBase] => {
            const [duplicatedNode, featuresToDuplicate] = duplicateNode(node);
            const duplicateFeatureValue = (feature: Feature) => {
                const value = getFeatureValue(node, feature);
                if (feature instanceof Property) {
                    duplicatedNode.getPropertyValueManager(feature).setDirectly(value);
                } else if (feature instanceof Link) {
                    const values = asArray(value as (SingleRef<INodeBase> | SingleRef<INodeBase>[]));
                    const resolvedValues = values.filter((value) => value !== unresolved) as INodeBase[];
                    if (resolvedValues.length > 0) {
                        nodesToInstall.push([
                            duplicatedNode,
                            feature,
                            resolvedValues.map(idOf),
                            feature instanceof Reference
                                ? resolvedValues
                                : undefined
                        ]);
                    }
                }
            };
            featuresToDuplicate.forEach(duplicateFeatureValue);
            if (node.annotations.length > 0) {
                nodesToInstall.push([duplicatedNode, null, node.annotations.map(idOf)]);
            }
            return [node.id, duplicatedNode];
        }

        const duplicatedNodesByOriginalId = Object.fromEntries(
            nodes.flatMap(allNodesFrom).map(visit)
        );

        nodesToInstall.forEach(([copiedNode, feature, ids, originalReferenceTargets]) => {
            if (feature instanceof Containment) {
                const valueManager = copiedNode.getContainmentValueManager(feature);
                ids.forEach((id) => {
                    const nodeToInstall = duplicatedNodesByOriginalId[id];
                    valueManager.addDirectly(nodeToInstall);
                    nodeToInstall.attachTo(copiedNode, feature);
                });
                return;
            }
            if (feature instanceof Reference) {
                const valueManager = copiedNode.getReferenceValueManager(feature);
                ids.forEach((id, index) => {
                    const nodeToInstall = duplicatedNodesByOriginalId[id] ?? originalReferenceTargets![index];
                    valueManager.addDirectly(nodeToInstall);
                });
                return;
            }
            if (feature === null) {
                const valueManager = copiedNode.annotationsValueManager;
                ids.forEach((id) => {
                    const nodeToInstall = duplicatedNodesByOriginalId[id];
                    valueManager.addDirectly(nodeToInstall);
                })
                return;
            }
        });

        return nodes.map(({id}) => duplicatedNodesByOriginalId[id]);

    };

