// Copyright 2026 TRUMPF Laser SE and other contributors
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
// SPDX-FileCopyrightText: 2026 TRUMPF Laser SE and other contributors
// SPDX-License-Identifier: Apache-2.0

import {
    LionWebJsonChunk,
    LionWebJsonContainment,
    LionWebJsonMetaPointer,
    LionWebJsonNode,
    LionWebJsonProperty,
    LionWebJsonReference,
    LionWebJsonReferenceTarget,
    LionWebJsonUsedLanguage,
    LionWebSerializationFormatVersion
} from "./types.js"


/**
 * Type def. for a function that transforms a {@link LionWebJsonChunk LionWeb serialization chunk} into another one.
 */
export type LionWebJsonChunkTransformer = (chunk: LionWebJsonChunk) => LionWebJsonChunk


/**
 * Type def. for a configuration for the {@link chunkTransformerWith} HOF.
 * Each of its properties is optional: when present, that function is used to transform a certain part of a chunk,
 * otherwise that part is transformed identically(/“copied”).
 */
export type ChunkTransformerConfiguration = Partial<{

    /** Transforms the stated `serializationFormatVersion`. */
    serializationFormatVersion: (current: LionWebSerializationFormatVersion) => LionWebSerializationFormatVersion

    /** Transforms every member of `languages`. */
    usedLanguage: (current: LionWebJsonUsedLanguage) => LionWebJsonUsedLanguage

    /** Transforms the stated `classifier` meta-pointer of every node in `nodes`. */
    classifierMetaPointer: (current: LionWebJsonMetaPointer) => LionWebJsonMetaPointer

    /** Transforms the stated `property`/`containment`/`reference` meta-pointer
     * of every member of `properties`/`containments`/`references` (respectively)
     * of every node in `nodes`. */
    featureMetaPointer: (current: LionWebJsonMetaPointer) => LionWebJsonMetaPointer

    /**
     * Transforms every {@link LionWebJsonReferenceTarget} in `targets`
     * of every member of `references`
     * of every node in `nodes`.
     */
    referenceTarget: (current: LionWebJsonReferenceTarget) => LionWebJsonReferenceTarget

}>


const applyOrIdent = <T>(func?: (t: T) => T) =>
    (t: T) =>
        func ? func(t) : t

const mapOrIdent = <T>(func?: (t: T) => T) =>
    (ts: T[]) =>
        func ? ts.map(func) : ts

/**
 * @return a {@link LionWebJsonChunkTransformer} configured using the given `configuration`.
 */
export const chunkTransformerWith = (configuration: ChunkTransformerConfiguration): LionWebJsonChunkTransformer =>
    (chunk): LionWebJsonChunk => {
        const updatedUsedLanguages = mapOrIdent(configuration.usedLanguage)
        const updatedClassifierMetaPointer = applyOrIdent(configuration.classifierMetaPointer)
        const updatedFeatureMetaPointer = applyOrIdent(configuration.featureMetaPointer)
        const updatedReferenceTargets = mapOrIdent(configuration.referenceTarget)
        return {
            serializationFormatVersion: applyOrIdent(configuration.serializationFormatVersion)(chunk.serializationFormatVersion),
            languages: updatedUsedLanguages(chunk.languages),
            nodes: chunk.nodes.map(({ id, classifier, properties, containments, references, annotations, parent }) => ({
                id,
                classifier: updatedClassifierMetaPointer(classifier),
                properties: properties.map(({ property, value }) => ({
                    property: updatedFeatureMetaPointer(property),
                    value
                }) satisfies LionWebJsonProperty),
                containments: containments.map(({ containment, children }) => ({
                    containment: updatedFeatureMetaPointer(containment),
                    children
                }) satisfies LionWebJsonContainment),
                references: references.map(({ reference, targets }) => ({
                    reference: updatedFeatureMetaPointer(reference),
                    targets: updatedReferenceTargets(targets)
                }) satisfies LionWebJsonReference),
                annotations,
                parent
            } satisfies LionWebJsonNode))
        } satisfies LionWebJsonChunk
    }

