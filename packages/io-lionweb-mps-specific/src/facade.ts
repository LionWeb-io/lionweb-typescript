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
    areSameClassifiers,
    areSameLanguages,
    Classifier,
    InstantiationFacade,
    lioncoreFacade,
    lioncoreWriter,
    M3Concept,
    M3Node,
    Node,
    updateSettingsNameBased
} from "@lionweb/core"
import { LionWebId, LionWebKey } from "@lionweb/json"

import { ioLionWebMpsSpecificClassifiers, ioLionWebMpsSpecificLanguage } from "./definition.js"
import {
    ConceptDescription,
    Deprecated,
    IoLionWebMpsSpecificAnnotation,
    KeyedDescription,
    ShortDescription,
    VirtualPackage
} from "./implementation.js"

const ioLionWebMpsSpecificFactory = (parent: Node | undefined, classifier: Classifier, id: LionWebId, propertySettings: { [propertyKey: LionWebKey]: unknown }) => {

    const setProperties = <T extends IoLionWebMpsSpecificAnnotation>(node: T, ...namesOfOptionalStringProperties: (keyof T)[]) => {
        namesOfOptionalStringProperties.forEach((propertyName) => {
            node[propertyName] = propertySettings[`${node.classifier.name}-${String(propertyName)}`] as T[typeof propertyName]
        })
    }

    if (areSameClassifiers(classifier, ioLionWebMpsSpecificClassifiers.ConceptDescription)) {
        const node = new ConceptDescription(id)
        node.parent = parent
        setProperties(node, "conceptAlias", "conceptShortDescription", "helpUrl")
        return node
    }
    if (areSameClassifiers(classifier, ioLionWebMpsSpecificClassifiers.Deprecated)) {
        const node = new Deprecated(id)
        node.parent = parent
        setProperties(node, "build", "comment")
        return node
    }
    if (areSameClassifiers(classifier, ioLionWebMpsSpecificClassifiers.KeyedDescription)) {
        const node = new KeyedDescription(id)
        node.parent = parent
        setProperties(node, "documentation")
        return node
    }
    if (areSameClassifiers(classifier, ioLionWebMpsSpecificClassifiers.ShortDescription)) {
        const node = new ShortDescription(id)
        node.parent = parent
        setProperties(node, "description")
        return node
    }
    if (areSameClassifiers(classifier, ioLionWebMpsSpecificClassifiers.VirtualPackage)) {
        const node = new VirtualPackage(id)
        node.parent = parent
        setProperties(node, "name")
        return node
    }

    throw new Error(`don't know how to instantiate a ${classifier.name}`)
}


export const combinedWriter: InstantiationFacade<M3Node | IoLionWebMpsSpecificAnnotation, Node> = {
    encodingOf: (_literal) => undefined,    // (there are no literals in either LionCore/M3 or io.lionweb.mps.specific)
    nodeFor: (parent, classifier, id, propertySettings) => {
        if (areSameLanguages(classifier.language, ioLionWebMpsSpecificLanguage)) {
            return ioLionWebMpsSpecificFactory(parent, classifier, id, propertySettings)
        }
        if (areSameLanguages(classifier.language, lioncoreFacade.language)) {
            return lioncoreWriter.nodeFor(parent as M3Concept, classifier, id, propertySettings)
        }
        throw new Error(`don't know how to instantiate a ${classifier.name} from language ${classifier.language.name} (${classifier.language.key}, ${classifier.language.version})`)
    },
    setFeatureValue: (node, feature, value) => {
        updateSettingsNameBased(node as unknown as Record<string, unknown>, feature, value)
    }
}

