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

import {
    Id,
    incomingReferences as lwIncomingReferences,
    ReferenceValue
} from "@lionweb/core";
import {deepDuplicateWith, DeltaHandler, IdMapping, ILanguageBase, INodeBase} from "./index.js";
import {nodeBaseReader} from "./serializer.js";
import {NodeDuplicator} from "./duplicator.js";


/**
 * @return all descendant nodes from the given node, including that node itself.
 */
export const allNodesFrom = (rootNode: INodeBase): INodeBase[] => {
    const nodes: INodeBase[] = [rootNode];
    const visit = (node: INodeBase) => {
        const children = node.children;
        nodes.push(...children);
        children.forEach(visit);
    }
    visit(rootNode);
    return nodes;
}


/**
 * Finds all references coming into the given target node or any of the given target nodes,
 * within the search scope (given as _root_ nodes),
 * returning these as {@link ReferenceValue reference values}.
 * Note that any reference is found uniquely,
 * i.e. the returned {@link ReferenceValue reference values} are pairwise distinct,
 * even if the given target nodes or scope contain duplicate nodes.
 *
 * @param targetNodeOrNodes one or more target {@link Node nodes} for which the incoming references are searched
 * @param rootNodesInScope the {@link Node _root_ nodes} of the model that's searched for references
 */
export const incomingReferences = (targetNodeOrNodes: INodeBase | INodeBase[], rootNodesInScope: INodeBase[]): ReferenceValue<INodeBase>[] =>
    lwIncomingReferences(targetNodeOrNodes, rootNodesInScope.flatMap(allNodesFrom), nodeBaseReader);


/**
 * @return a function that deep-clones the given nodes (of type {@link INodeBase}),
 * *without* generating new IDs.
 * @param languageBases the {@link ILanguageBase language bases} of the languages that the nodes might come from
 *  — these are necessary for their factories
 * @param handleDelta an optional {@link DeltaHandler} that gets installed on the deep-cloned nodes
 */
export const deepClonerFor = (languageBases: ILanguageBase[], handleDelta?: DeltaHandler) =>
    deepDuplicatorFor(languageBases, (originalNode) => originalNode.id, handleDelta);


/**
 * Type definition for functions that compute a – not necessarily new – ID from a given original {@link INodeBase node}.
 */
export type NewIdFunction = (originalNode: INodeBase) => Id;


/**
 * @return a {@link NodeDuplicator} function that does the “obvious” thing, given the parameters:
 * @param languageBases an array of languages in the form of {@link ILanguageBase}s
 * @param newIdFunc a function that computes a – not necessarily new – ID from a given original {@link INodeBase node}
 * @param handleDelta an optional {@link DeltaHandler}
 * @param idMapping an optional {@link IdMapping}
 */
export const defaultNodeDuplicatorFor = (languageBases: ILanguageBase[], newIdFunc: NewIdFunction, handleDelta?: DeltaHandler, idMapping?: IdMapping): NodeDuplicator =>
    (originalNode: INodeBase) => {
        const languageBase = languageBases.find((languageBase) => languageBase.language === originalNode.classifier.language)!;
        const duplicatedNode = languageBase.factory(handleDelta)(originalNode.classifier, newIdFunc(originalNode));
        idMapping?.updateWith(duplicatedNode);
        return [duplicatedNode, originalNode.setFeatures];
    };


/**
 * @return a function that deep-duplicates the given nodes (of type {@link INodeBase}),
 * computing IDs using the `newIdFunc` function passed as the 2nd argument.
 * @param languageBases the {@link ILanguageBase language bases} of the languages that the nodes might come from
 *  — these are necessary for their factories
 * @param newIdFunc a function that computes a – not necessarily new – ID from a given original {@link INodeBase node}
 * @param handleDelta an optional {@link DeltaHandler} that gets installed on the deep-cloned nodes
 */
export const deepDuplicatorFor = (languageBases: ILanguageBase[], newIdFunc: NewIdFunction, handleDelta?: DeltaHandler, idMapping?: IdMapping) =>
    deepDuplicateWith(defaultNodeDuplicatorFor(languageBases, newIdFunc, handleDelta, idMapping));

