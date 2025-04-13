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

import { allFeaturesOf, allSuperTypesOf, Annotation, Classifier, Concept, Feature, Interface, MultiRef, SingleRef } from "@lionweb/core"
import { uniquesAmong } from "@lionweb/utilities/dist/utils/array.js"

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

export const implementsFrom = (classifier: Classifier): MultiRef<Classifier> => {
    if (classifier instanceof Annotation) {
        return classifier.implements
    }
    if (classifier instanceof Concept) {
        return classifier.implements
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

