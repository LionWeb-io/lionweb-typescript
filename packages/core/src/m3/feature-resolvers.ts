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

import { LionWebJsonMetaPointer } from "@lionweb/json"

import { Classifier, Containment, Feature, Language, Property, Reference } from "./types.js"
import { MemoisingSymbolTable } from "./symbol-table.js"


/**
 * Type def. for functions that resolve a {@link Feature feature} of the indicated sub-type
 * from a feature's and a classifier's meta-pointers,
 * throwing an {@link Error error} when the feature couldn't be resolved,
 * or it isn't of the expected sub-type.
 */
export type FeatureResolver<FT extends Feature> = (metaPointer: LionWebJsonMetaPointer, classifier: Classifier) => FT

/**
 * Type def. for an object containing {@link FeatureResolver resolvers} for
 * {@link Property properties}, {@link Containmnent containments}, and {@link Reference references}.
 */
export type FeatureResolvers = {
    resolvedPropertyFrom: FeatureResolver<Property>
    resolvedContainmentFrom: FeatureResolver<Containment>
    resolvedReferenceFrom: FeatureResolver<Reference>
}

/**
 * @return an {@link FeatureResolvers object} for the given {@link Language languages}.
 */
export const featureResolversFor = (languages: Language[]): FeatureResolvers => {
    const symbolTable = new MemoisingSymbolTable(languages)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const featureResolverFor = <FT extends Feature>(featureClassConstructor: new (...args: any[]) => FT): FeatureResolver<FT> =>
        (featureMetaPointer, classifier: Classifier) => {
            const classifierMetaPointer = classifier.metaPointer()
            const featureLocationMessage = () => `feature with meta-pointer ${JSON.stringify(featureMetaPointer)} on classifier with meta-pointer ${JSON.stringify(classifierMetaPointer)}`
            const feature = symbolTable.featureMatching(classifierMetaPointer, featureMetaPointer)
            if (feature === undefined) {
                throw new Error(`couldn't resolve ${featureLocationMessage()}`)    // fail early <== unrecoverable
            }
            if (feature.constructor !== featureClassConstructor) {  // feature's type must match desired type *exactly* — cheaper to evaluate than "feature instanceof featureClassConstructor"
                throw new Error(`${featureLocationMessage()} is not a ${featureClassConstructor.name} but a ${feature.constructor.name}`)    // fail early <== unrecoverable
            }
            /*
             * We could make this function memoising as well, to avoid having to perform these checks every resolution.
             * That memoisation would involve a 6-deep lookup, in the feature's meta-pointer + container's classifier meta-pointer.
             * The checks seem cheap enough to not be problematic performance-wise, though.
             */
            return feature as FT    // valid <== feature.constructor === featureClassConstructor
        }
    return {
        resolvedPropertyFrom: featureResolverFor(Property),
        resolvedContainmentFrom: featureResolverFor(Containment),
        resolvedReferenceFrom: featureResolverFor(Reference)
    }
}

