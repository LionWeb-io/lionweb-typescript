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

import { Classifier, INamed, Node } from "@lionweb/core"
import { ioLionWebMpsSpecificClassifiers } from "./definition.js"

/*
 * An implementation of the io.lionweb.mps.specific language as TypeScript classes.
 *
 * This is written by hand (and not generated e.g. using the `class-core-generator`) to avoid meta-level crossing headaches.
 * That means it has to be kept in sync with its definition in the meta/io.lionweb.mps.specific.json file manually!
 * Specifically, each language’s concept maps to a concrete class that extends IoLionWebMpsSpecificAnnotation.
 * (The `IoLionWebMpsSpecificAnnotation` abstract class is an implementation detail, and there’s no concept corresponding to it.)
 */

export abstract class IoLionWebMpsSpecificAnnotation implements Node {
    protected constructor(public readonly id: string, public readonly classifier: Classifier) {
    }
    public parent?: Node
    public readonly annotations: Node[] = []
}

export class ConceptDescription extends IoLionWebMpsSpecificAnnotation {
    constructor(id: string) {
        super(id, ioLionWebMpsSpecificClassifiers.ConceptDescription)
    }
    public conceptAlias?: string
    public conceptShortDescription?: string
    public helpUrl?: string
}

export class Deprecated extends IoLionWebMpsSpecificAnnotation {
    constructor(id: string) {
        super(id, ioLionWebMpsSpecificClassifiers.Deprecated)
    }
    public comment?: string
    public build?: string
}

export class KeyedDescription extends IoLionWebMpsSpecificAnnotation {
    constructor(id: string) {
        super(id, ioLionWebMpsSpecificClassifiers.KeyedDescription)
    }
    public documentation?: string
    public readonly seeAlso: Node[] = []
}

export class ShortDescription extends IoLionWebMpsSpecificAnnotation {
    constructor(id: string) {
        super(id, ioLionWebMpsSpecificClassifiers.ShortDescription)
    }
    public description?: string
}

export class VirtualPackage extends IoLionWebMpsSpecificAnnotation implements INamed {
    constructor(id: string) {
        super(id, ioLionWebMpsSpecificClassifiers.VirtualPackage)
    }
    private _name?: string
    get name() {
        if (this._name === undefined) {
            throw new Error(`trying to read unset "name" property of instance of "VirtualPackage" annotation`)
        }
        return this._name
    }
    set name(newName: string) {
        this._name = newName
    }
}

