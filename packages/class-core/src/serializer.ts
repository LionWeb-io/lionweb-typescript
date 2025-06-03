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
    allSuperTypesOf,
    builtinClassifiers,
    builtinFeatures,
    Containment,
    ExtractionFacade,
    Feature,
    Property,
    Reference,
    serializeNodes
} from "@lionweb/core"

import { INodeBase, LionCore_builtinsBase } from "./index.js"


/**
 * @return the value of the given {@link Feature feature} (2nd argument) on the given node (of type {@link INodeBase}; 1st argument).
 * **Note** that this function is for internal use only!
 */
export const getFeatureValue = (node: INodeBase, feature: Feature) => {
    if (feature instanceof Property) {
        return node.getPropertyValueManager(feature).getDirectly();
    }
    if (feature instanceof Containment) {
        return node.getContainmentValueManager(feature).getDirectly();
    }
    if (feature instanceof Reference) {
        return node.getReferenceValueManager(feature).getDirectly();
    }
    throw new Error(`unhandled Feature sub type ${feature.constructor.name}`)
};

/**
 * An {@link ExtractionFacade} that works on/for {@link INodeBase}s specifically.
 * **Note** that this function is for internal use only!
 */
export const nodeBaseReader: ExtractionFacade<INodeBase> = {
    classifierOf: (node) => node.classifier,
    getFeatureValue,
    enumerationLiteralFrom: (encoding, enumeration) => {
        return enumeration.literals.find((literal) => literal.key === encoding)!;
    },
    resolveInfoFor: (node: INodeBase) => {
        if ("name" in node) {
            // evaluating `node.name` might cause an error through FeatureValueManager.throwOnReadOfUnset:
            try {
                const value = node.name;
                return typeof value === "string" ? value : undefined;
            } catch (_) {
                return undefined;
            }
        }
        const allSupertypes = allSuperTypesOf(node.classifier);
        if (allSupertypes.indexOf(builtinClassifiers.inamed) > -1) {
            return node.getPropertyValueManager(builtinFeatures.inamed_name).getDirectly() as (string | undefined);
        }
        if (allSupertypes.indexOf(LionCore_builtinsBase.INSTANCE.INamed) > -1) {
            return node.getPropertyValueManager(LionCore_builtinsBase.INSTANCE.INamed_name).getDirectly() as (string | undefined);
        }
        return undefined;
    }
};

/**
 * @return a serialization of the given nodes (of type {@link INodeBase}) as a {@link LionWebJsonChunk}.
 */
export const serializeNodeBases = (nodes: INodeBase[]) =>
    serializeNodes(nodes, nodeBaseReader, { serializeEmptyFeatures: false });

