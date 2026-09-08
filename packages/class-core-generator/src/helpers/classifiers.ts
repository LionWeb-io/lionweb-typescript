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
    allFeaturesOf,
    allSuperTypesOf,
    Annotation,
    Classifier,
    Concept,
    Feature,
    inheritsDirectlyFrom,
    Interface,
    isResolvedReference,
    Language,
    SingleRef
} from "@lionweb/core"
import { uniquesAmong } from "@lionweb/ts-utils"

export const isAbstract = (classifier: Classifier): boolean => classifier instanceof Concept && classifier.abstract
/*
 * The logical inverse is: classifier instanceof Annotation || (classifier instanceof Concept && !classifier.abstract)
 */


export const extendsFrom = (classifier: Classifier): SingleRef<Classifier> | undefined => {
    if (classifier instanceof Annotation) {
        return classifier.extends
    }
    if (classifier instanceof Concept) {
        return classifier.extends
    }
    return undefined
}

export const implementsFrom = (classifier: Classifier): Classifier[] => {
    if (classifier instanceof Annotation) {
        return classifier.implements.filter(isResolvedReference)
    }
    if (classifier instanceof Concept) {
        return classifier.implements.filter(isResolvedReference)
    }
    return []
}

export const featuresToConcretelyImplementOf = (classifier: Classifier): Feature[] => {
    if (classifier instanceof Interface) {
        return []
    }
    const implementedFeatures = uniquesAmong(allSuperTypesOf(classifier).flatMap(featuresToConcretelyImplementOf))
    return allFeaturesOf(classifier)
        .filter((feature) => implementedFeatures.indexOf(feature) === -1)
}


/**
 * A type alias for a {@link Map} mapping {@link Classifier classifiers} to their specializations.
 */
export type DirectSpecializationsPerClassifier = Map<Classifier, Classifier[]>

/**
 * @return a {@link DirectSpecializationsPerClassifier} mapping {@link Classifier classifiers} in the given {@link Language `languages`} having one or more specializations,
 * to those specializations.
 */
export const directSpecializationsPerClassifier = (languages: Language[]): DirectSpecializationsPerClassifier => {
    const map: DirectSpecializationsPerClassifier = new Map()
    const addLazily = (key: Classifier, valueToAdd: Classifier) => {
        if (!map.has(key)) {
            map.set(key, [])
        }
        map.get(key)!.push(valueToAdd)
    }

    for (const language of languages) {
        for (const classifier of language.entities.filter((entity) => entity instanceof Classifier)) {
            inheritsDirectlyFrom(classifier).forEach((superType) => {
                addLazily(superType, classifier)
            })
        }
    }

    return map
}

