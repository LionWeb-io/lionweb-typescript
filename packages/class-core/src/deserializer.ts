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
    BuiltinPropertyValueDeserializer,
    Classifier,
    Containment,
    defaultSimplisticHandler,
    Enumeration,
    Language,
    MemoisingSymbolTable,
    PrimitiveType,
    Property,
    PropertyValueDeserializer,
    Reference,
    SimplisticHandler,
    unresolved
} from "@lionweb/core"
import { LionWebId, LionWebJsonChunk, LionWebJsonNode } from "@lionweb/json"
import { byIdMap, keepDefineds } from "@lionweb/ts-utils"

import { DeltaReceiver, IdMapping, ILanguageBase, INodeBase } from "./index.js"
import { NodesToInstall } from "./linking.js"


/**
 * A type for deserializer functions that are parametrized in their return type.
 */
export type Deserializer<T> = (
    serializationChunk: LionWebJsonChunk,
    dependentNodes?: INodeBase[],
    propertyValueDeserializer?: PropertyValueDeserializer,
    problemHandler?: SimplisticHandler
) => T;


const languageBaseLookupFor = (languageBases: ILanguageBase[]) =>
    (language: Language) => {
        const languageBase = languageBases.find((languageBase) => languageBase.language === language);
        if (languageBase === undefined) {
            throw new Error(`language ${language.name} (with key=${language.key} and version=${language.version}) not known`);
        }
        return languageBase;
    };

const factoryLookupFor = (languageBases: ILanguageBase[], receiveDelta?: DeltaReceiver) => {
    const lookup = languageBaseLookupFor(languageBases);
    return (language: Language) => lookup(language).factory(receiveDelta);
}


/**
 * A quasi-tuple of the roots (of type {@link INodeBase}) of a model,
 * and its {@link IdMapping} instance.
 */
export type RootsWithIdMapping = { roots: INodeBase[], idMapping: IdMapping };


/**
 * @return a {@link Deserializer} function for the given languages (given as {@link ILanguageBase}s) that returns a {@link RootsWithIdMapping}.
 * @param languageBases the {@link ILanguageBase}s for (at least) all the languages used in the {@link LionWebJsonChunk} to deserialize, minus LionCore M3 and built-ins.
 * @param receiveDelta an optional {@link DeltaReceiver} that will be injected in all {@link INodeBase nodes} created.
 */
export const nodeBaseDeserializerWithIdMapping = (languageBases: ILanguageBase[], receiveDelta?: DeltaReceiver): Deserializer<RootsWithIdMapping> => {

    const symbolTable = new MemoisingSymbolTable(languageBases.map(({language}) => language));
    const languageBaseFor = languageBaseLookupFor(languageBases);
    const factoryFor = factoryLookupFor(languageBases, receiveDelta);

    return (
        serializationChunk: LionWebJsonChunk,
        dependentNodes: INodeBase[] = [],
        propertyValueDeserializer: PropertyValueDeserializer = new BuiltinPropertyValueDeserializer(),
        problemsHandler: SimplisticHandler = defaultSimplisticHandler
    ): RootsWithIdMapping => {

        const nodesToInstall: NodesToInstall[] = [];

        const createNode = ({id, classifier: classifierMetaPointer, properties, containments, references, annotations}: LionWebJsonNode): (INodeBase | undefined) => {
            const languageMessage = `language ${classifierMetaPointer.language} (${classifierMetaPointer.version})`;
            const classifier = symbolTable.entityMatching(classifierMetaPointer);
            if (classifier === undefined || !(classifier instanceof Classifier)) {
                problemsHandler.reportProblem(`can't deserialize node with id=${id}: can't find the classifier with key ${classifierMetaPointer.key} in ${languageMessage} - skipping`);
                return undefined;
            }

            const node = factoryFor(classifier.language)(classifier, id);

            properties.forEach(({property: propertyMetaPointer, value}) => {
                const feature = symbolTable.featureMatching(classifierMetaPointer, propertyMetaPointer);
                if (feature === undefined) {
                    problemsHandler.reportProblem(`can't deserialize value for feature with key ${propertyMetaPointer.key} in ${languageMessage}: feature not found on classifier ${classifierMetaPointer.key} in language (${classifierMetaPointer.language}, ${classifierMetaPointer.version}) - skipping`);
                } else if (feature instanceof Property) {
                    if (feature.type instanceof PrimitiveType) {
                        node.getPropertyValueManager(feature).setDirectly(value === null ? undefined : propertyValueDeserializer.deserializeValue(value, feature));
                    } else if (feature.type instanceof Enumeration) {
                        if (value !== undefined) {
                            const literal = feature.type.literals.find((literal) => literal.key === value);
                            if (literal === undefined) {
                                problemsHandler.reportProblem(`can't deserialize literal encoded as: ${value}`);
                            } else {
                                node.getPropertyValueManager(feature).setDirectly(languageBaseFor(feature.type.language).enumLiteralFrom(literal));
                            }
                        }
                    }
                } else {
                    problemsHandler.reportProblem(`can't deserialize value for feature with key ${propertyMetaPointer.key} in ${languageMessage}: feature is not a property - skipping`);
                }
            });

            containments.forEach(({containment: containmentMetaPointer, children}) => {
                const feature = symbolTable.featureMatching(classifierMetaPointer, containmentMetaPointer);
                if (feature === undefined) {
                    problemsHandler.reportProblem(`can't deserialize value for feature with key ${containmentMetaPointer.key} in ${languageMessage}: feature not found on classifier ${classifierMetaPointer.key} in language (${classifierMetaPointer.language}, ${classifierMetaPointer.version}) - skipping`);
                } else if (feature instanceof Containment) {
                    nodesToInstall.push([node, feature, children]);
                } else {
                    problemsHandler.reportProblem(`can't deserialize value for feature with key ${containmentMetaPointer.key} in ${languageMessage}: feature is not a containment - skipping`);
                }
            });

            references.forEach(({reference: referenceMetaPointer, targets}) => {
                const feature = symbolTable.featureMatching(classifierMetaPointer, referenceMetaPointer);
                if (feature === undefined) {
                    problemsHandler.reportProblem(`can't deserialize value for feature with key ${referenceMetaPointer.key} in ${languageMessage}: feature not found on classifier ${classifierMetaPointer.key} in language (${classifierMetaPointer.language}, ${classifierMetaPointer.version}) - skipping`);
                } else if (feature instanceof Reference) {
                    nodesToInstall.push([node, feature, targets.map(({reference}) => reference)]);
                } else {
                    problemsHandler.reportProblem(`can't deserialize value for feature with key ${referenceMetaPointer.key} in ${languageMessage}: feature is not a reference - skipping`);
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

        const dependentNodesById = byIdMap(dependentNodes)

        const lookupNodeById = (id: LionWebId) =>
            nodesById[id] ?? dependentNodesById[id];

        nodesToInstall.forEach(([node, feature, ids]) => {
            if (feature instanceof Containment) {
                const valueManager = node.getContainmentValueManager(feature);
                ids.forEach((id) => {
                    const nodeToInstall = lookupNodeById(id);
                    if (nodeToInstall === undefined) {
                        problemsHandler.reportProblem(`couldn't resolve the child with id=${id} of the "${feature.name}" containment feature on the node with id=${node.id}`);
                    } else {
                        valueManager.addDirectly(nodeToInstall);
                        nodeToInstall.attachTo(node, feature);
                    }
                });
                return;
            }
            if (feature instanceof Reference) {
                const valueManager = node.getReferenceValueManager(feature);
                ids.forEach((id) => {
                    const nodeToInstall = lookupNodeById(id);
                    if (nodeToInstall === undefined) {
                        problemsHandler.reportProblem(`couldn't resolve the target with id=${id} of the "${feature.name}" reference feature on the node with id=${node.id}`);
                        valueManager.addDirectly(unresolved);
                    } else {
                        valueManager.addDirectly(nodeToInstall);
                    }
                });
                return;
            }
            if (feature === null) {
                const valueManager = node.annotationsValueManager;
                ids.forEach((id) => {
                    const nodeToInstall = lookupNodeById(id);
                    if (nodeToInstall === undefined) {
                        problemsHandler.reportProblem(`couldn't resolve the annotation with id=${id} on the node with id=${node.id}`);
                    } else {
                        valueManager.addDirectly(nodeToInstall);
                        nodeToInstall.attachTo(node, feature);
                    }
                });
                return;
            }
        });

        return {
            roots: Object.values(nodesById)
                .filter(({parent}) => parent === undefined),
            idMapping: new IdMapping({ ...nodesById, ...dependentNodesById })
        };

    };
};


/**
 * @return a {@link Deserializer} function for the languages (given as {@link ILanguageBase}s) that returns the roots (of type {@link INodeBase}) of the deserialized model.
 * @param languageBases the {@link ILanguageBase}s for (at least) all the languages used in the {@link LionWebJsonChunk} to deserialize, minus LionCore M3 and built-ins.
 * @param receiveDelta an optional {@link DeltaReceiver} that will be injected in all {@link INodeBase nodes} created.
 */
export const nodeBaseDeserializer = (languageBases: ILanguageBase[], receiveDelta?: DeltaReceiver): Deserializer<INodeBase[]> => {
    const deserializerWithIdMapping = nodeBaseDeserializerWithIdMapping(languageBases, receiveDelta);
    return (
        serializationChunk: LionWebJsonChunk,
        dependentNodes: INodeBase[] = [],
        propertyValueDeserializer: PropertyValueDeserializer = new BuiltinPropertyValueDeserializer(),
        problemsHandler: SimplisticHandler = defaultSimplisticHandler
    ): INodeBase[] =>
        deserializerWithIdMapping(serializationChunk, dependentNodes, propertyValueDeserializer, problemsHandler).roots
}

