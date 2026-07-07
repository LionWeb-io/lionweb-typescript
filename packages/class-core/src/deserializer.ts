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
    Classifier,
    completeSerializationConfigurationWithDefaults,
    Containment,
    MemoisingSymbolTable,
    Property,
    Reference,
    UnresolvedReference
} from "@lionweb/core"
import { LionWebId, LionWebJsonNode, LionWebJsonReferenceTarget, OnlyNodesOfLionWebJsonChunk } from "@lionweb/json"
import { byIdMap, keepDefineds } from "@lionweb/ts-utils"

import { INodeBase } from "./base-types.js"
import { IdMapping } from "./id-mapping.js"
import { combinedLanguageBaseLookupFor } from "./factory.js"
import { NodesToInstall } from "./linking.js"
import { nodeBasePropertyValueDeserializerWith, NodeBaseSerializationConfiguration } from "./configuration.js"


/**
 * A type for deserializer functions that are parametrized in their return type.
 */
export type Deserializer<T> = (
    /**
     * The {@link LionWebJsonChunk serialization chunk} to deserialize.
     * **Note** that we only need the nodes for deserialization, hence the use of the {@link OnlyNodesOfLionWebJsonChunk}.
     */
    serializationChunk: OnlyNodesOfLionWebJsonChunk,
    /**
     * The {@link IdMapping ID mapping} of existing nodes that the given `serializationChunk` may link to.
     */
    idMapping?: IdMapping
) => T;


/**
 * A quasi-tuple of the deserialized nodes and roots (both of type {@link INodeBase}) of a model,
 * and its {@link IdMapping} instance.
 */
export type DetailedDeserialization = {

    /**
     * All nodes deserialized by a {@link Deserializer}.
     */
    nodes: INodeBase[],

    /**
     * All root nodes among the deserialized {@link nodes}.
     * A node is a root node if its serialization did not declare a parent.
     * *Note* that the parent of a root node might not be actually resolved during this deserialization.
     */
    roots: INodeBase[],

    /**
     * A {@link IdMapping} corresponding to {@link nodes}.
     */
    idMapping: IdMapping

};


/**
 * @return a {@link Deserializer} function that returns a {@link DetailedDeserialization}.
 * @param configuration a {@link DeserializerConfiguration configuration object} for the deserializer.
 */
export const nodeBaseDetailedDeserializerWith = (configuration: Omit<NodeBaseSerializationConfiguration, "primitiveValueSerializerRegistry">): Deserializer<DetailedDeserialization> => {
    const propertyValueDeserializer = nodeBasePropertyValueDeserializerWith(configuration);
    const { languageBases, receiveDelta } = configuration;
    const languageBaseFor = combinedLanguageBaseLookupFor(configuration.languageBases);
    const { lionWebVersion, problemReporter } = completeSerializationConfigurationWithDefaults(configuration);

    const symbolTable = new MemoisingSymbolTable(languageBases.map(({ language }) => language));

    return (serializationChunk, idMapping): DetailedDeserialization => {

        const nodesToInstall: NodesToInstall[] = [];

        const createNode = ({id, classifier: classifierMetaPointer, properties, containments, references, annotations}: LionWebJsonNode): (INodeBase | undefined) => {
            const languageMessage = `language ${classifierMetaPointer.language} (${classifierMetaPointer.version})`;
            const classifier = symbolTable.entityMatching(classifierMetaPointer);
            if (classifier === undefined || !(classifier instanceof Classifier)) {
                problemReporter.reportProblem(`can't deserialize node with id=${id}: can't find the classifier with key ${classifierMetaPointer.key} in ${languageMessage} - skipping`);
                return undefined;
            }

            const node = languageBaseFor(classifier.language).factory(receiveDelta)(classifier, id);

            properties.forEach(({property: propertyMetaPointer, value}) => {
                const feature = symbolTable.featureMatching(classifierMetaPointer, propertyMetaPointer);
                if (feature === undefined) {
                    problemReporter.reportProblem(`can't deserialize value for feature with key ${propertyMetaPointer.key} in ${languageMessage}: feature not found on classifier ${classifierMetaPointer.key} in language (${classifierMetaPointer.language}, ${classifierMetaPointer.version}) - skipping`);
                } else if (feature instanceof Property) {
                    node.getPropertyValueManager(feature).setDirectly(value === null ? undefined : propertyValueDeserializer(feature, value))
                } else {
                    problemReporter.reportProblem(`can't deserialize value for feature with key ${propertyMetaPointer.key} in ${languageMessage}: feature is not a property - skipping`);
                }
            });

            containments.forEach(({containment: containmentMetaPointer, children}) => {
                const feature = symbolTable.featureMatching(classifierMetaPointer, containmentMetaPointer);
                if (feature === undefined) {
                    problemReporter.reportProblem(`can't deserialize value for feature with key ${containmentMetaPointer.key} in ${languageMessage}: feature not found on classifier ${classifierMetaPointer.key} in language (${classifierMetaPointer.language}, ${classifierMetaPointer.version}) - skipping`);
                } else if (feature instanceof Containment) {
                    nodesToInstall.push([node, feature, children]);
                } else {
                    problemReporter.reportProblem(`can't deserialize value for feature with key ${containmentMetaPointer.key} in ${languageMessage}: feature is not a containment - skipping`);
                }
            });

            references.forEach(({reference: referenceMetaPointer, targets}) => {
                const feature = symbolTable.featureMatching(classifierMetaPointer, referenceMetaPointer);
                if (feature === undefined) {
                    problemReporter.reportProblem(`can't deserialize value for feature with key ${referenceMetaPointer.key} in ${languageMessage}: feature not found on classifier ${classifierMetaPointer.key} in language (${classifierMetaPointer.language}, ${classifierMetaPointer.version}) - skipping`);
                } else if (feature instanceof Reference) {
                    nodesToInstall.push(
                        [
                            node,
                            feature,
                            targets
                        ]
                    );
                } else {
                    problemReporter.reportProblem(`can't deserialize value for feature with key ${referenceMetaPointer.key} in ${languageMessage}: feature is not a reference - skipping`);
                }
            });

            if (annotations.length > 0) {
                nodesToInstall.push([node, null, annotations]);
            }

            return node;
        };

        const nodesById = byIdMap(
            keepDefineds(
                serializationChunk
                    .nodes
                    .map(createNode)
            )
        );

        const lookupNodeById = (id: LionWebId): (INodeBase | undefined) =>
            nodesById[id] ?? idMapping?.tryFromId(id);

        nodesToInstall.forEach(([node, feature, targets]) => {
            if (feature instanceof Containment) {
                const valueManager = node.getContainmentValueManager(feature);
                (targets as LionWebId[]).forEach((childId) => {
                    const nodeToInstall = lookupNodeById(childId);
                    if (nodeToInstall === undefined) {
                        problemReporter.reportProblem(`couldn't resolve the child with id=${childId} of the "${feature.name}" containment feature on the node with id=${node.id}`);
                    } else {
                        valueManager.addDirectly(nodeToInstall);
                        nodeToInstall.attachTo(node, feature);
                    }
                });
                return;
            }
            if (feature instanceof Reference) {
                const valueManager = node.getReferenceValueManager(feature);
                (targets as LionWebJsonReferenceTarget[]).forEach(({ reference: refId, resolveInfo }) => {
                    const target = (() => {
                        if (refId === null) {
                            return resolveInfo === null
                                ? undefined
                                : lionWebVersion.lookUpBuiltinLionCoreNodeBy(resolveInfo);
                        } else {
                            return lookupNodeById(refId);
                        }
                    })();
                    if (target === undefined) {
                        const metaTypeMessage = "concept" in node ? ` and (meta-)type ${node.concept}` : "";
                        problemReporter.reportProblem(
                            `couldn't resolve the target with id="${refId}" (and resolveInfo="${resolveInfo}") of a "${feature.name}" reference on the node with id=${node.id}${metaTypeMessage}`
                        );
                    }
                    valueManager.addDirectly(target ?? new UnresolvedReference(refId ?? undefined, resolveInfo ?? undefined));
                });
                return;
            }
            if (feature === null) {
                const valueManager = node.annotationsValueManager;
                (targets as LionWebId[]).forEach((annoId) => {
                    const nodeToInstall = lookupNodeById(annoId);
                    if (nodeToInstall === undefined) {
                        problemReporter.reportProblem(`couldn't resolve the annotation with id=${annoId} on the node with id=${node.id}`);
                    } else {
                        valueManager.addDirectly(nodeToInstall);
                        nodeToInstall.attachTo(node, feature);
                    }
                });
                return;
            }
        });

        const orphanedNodes = serializationChunk
            .nodes
            .filter(({ id, parent }) => nodesById[id] !== undefined && parent !== null && lookupNodeById(parent) === undefined);
        if (orphanedNodes.length > 0) {
            const multiple = orphanedNodes.length > 1;
            problemReporter.reportProblem(`${multiple ? `${orphanedNodes.length} ` : ``}orphaned node${multiple ? "s" : ""} encountered, with ID${multiple ? "s" : ""}: ${orphanedNodes.map(({ id }) => id).join(", ")}`);
        }

        return {
            nodes: Object.values(nodesById),
            roots: serializationChunk
                .nodes
                .filter(({ parent }) => parent === null)
                .map(({ id }) => nodesById[id]),
            idMapping: new IdMapping(nodesById)
        };

    };
}


/**
 * @return a {@link Deserializer} function that returns the roots (of type {@link INodeBase}) of the deserialized model.
 * @param configuration a {@link DeserializerConfiguration configuration object} for the deserializer.
 */
export const nodeBaseDeserializerWith = (configuration: Omit<NodeBaseSerializationConfiguration, "primitiveValueSerializerRegistry">): Deserializer<INodeBase[]> =>
    (serializationChunk, idMapping): INodeBase[] =>
        nodeBaseDetailedDeserializerWith(configuration)(serializationChunk, idMapping).roots;

