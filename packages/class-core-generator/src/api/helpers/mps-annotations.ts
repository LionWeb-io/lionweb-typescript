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

import {Id, SerializationChunk} from "@lionweb/core"


export abstract class MpsAnnotation {
    constructor(public readonly annotatedNodeId: Id) {
    }
}

export class ConceptDescription extends MpsAnnotation {
    constructor(annotatedNodeId: Id, public readonly shortDescription: string | null, public readonly alias: string | null) {
        super(annotatedNodeId)
    }
    toString() {
        return `<ConceptDescription> annotatedNodeId=${this.annotatedNodeId}, shortDescription="${this.shortDescription}"`
    }
}

export class Deprecated extends MpsAnnotation {
    constructor(annotatedNodeId: Id, public readonly comment: string | null, public readonly build: string | null) {
        super(annotatedNodeId)
    }
    toString() {
        return `<Deprecated> annotatedNodeId=${this.annotatedNodeId}, comment="${this.comment}", build="${this.build}"`
    }
}


export const extractedMpsAnnotations = ({nodes}: SerializationChunk): MpsAnnotation[] =>
    nodes.flatMap<MpsAnnotation>(({classifier, properties, parent}) => {
        const propertyValue = (key: string): string | null => {
            const property = properties.find(({property}) => property.key === key)
            return property === undefined
                ? null
                : property.value
        }
        if (classifier.language !== "io-lionweb-mps-specific" || classifier.version !== "0") {
            return []
        }
        switch (classifier.key) {
            case "ConceptDescription": {
                return [new ConceptDescription(parent!, propertyValue("ConceptDescription-conceptShortDescription"), propertyValue("ConceptDescription-conceptAlias"))]
            }
            case "Deprecated": {
                return [new Deprecated(parent!, propertyValue("Deprecated-comment"), propertyValue("Deprecated-build"))]
            }
            default: {
                console.log(`couldn't handle MPS annotation with key ${classifier.key}`)
                return []
            }
        }
    })

