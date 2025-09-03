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

// Warning: this file is generated!
// Modifying it by hand is useless at best, and sabotage at worst.

/*
 * language's metadata:
 *     name:    LionCore_builtins
 *     version: 2023.1
 *     key:     LionCore-builtins
 *     id:      LionCore-builtins
 */


import {
    Classifier,
    Concept,
    EnumerationLiteral,
    Interface,
    Language,
    PrimitiveType,
    Property
} from "@lionweb/core";

import {
    LionWebId
} from "@lionweb/json";

import {
    DeltaReceiver,
    ILanguageBase,
    INodeBase,
    NodeBase,
    NodeBaseFactory
} from "./index.js";


export class LionCore_builtinsBase implements ILanguageBase {

    private readonly _language: Language = new Language("LionCore_builtins", "2023.1", "LionCore-builtins", "LionCore-builtins");
    get language(): Language {
        this.ensureWiredUp();
        return this._language;
    }

    public readonly _String = new PrimitiveType(this._language, "String", "LionCore-builtins-String", "LionCore-builtins-String");
    get String(): PrimitiveType {
        this.ensureWiredUp();
        return this._String;
    }

    public readonly _Boolean = new PrimitiveType(this._language, "Boolean", "LionCore-builtins-Boolean", "LionCore-builtins-Boolean");
    get Boolean(): PrimitiveType {
        this.ensureWiredUp();
        return this._Boolean;
    }

    public readonly _Integer = new PrimitiveType(this._language, "Integer", "LionCore-builtins-Integer", "LionCore-builtins-Integer");
    get Integer(): PrimitiveType {
        this.ensureWiredUp();
        return this._Integer;
    }

    public readonly _JSON = new PrimitiveType(this._language, "JSON", "LionCore-builtins-JSON", "LionCore-builtins-JSON");
    get JSON(): PrimitiveType {
        this.ensureWiredUp();
        return this._JSON;
    }

    public readonly _Node = new Concept(this._language, "Node", "LionCore-builtins-Node", "LionCore-builtins-Node", true);
    get Node(): Concept {
        this.ensureWiredUp();
        return this._Node;
    }

    public readonly _INamed = new Interface(this._language, "INamed", "LionCore-builtins-INamed", "LionCore-builtins-INamed");
    get INamed(): Interface {
        this.ensureWiredUp();
        return this._INamed;
    }
    private readonly _INamed_name = new Property(this._INamed, "name", "LionCore-builtins-INamed-name", "LionCore-builtins-INamed-name");
    get INamed_name(): Property {
        this.ensureWiredUp();
        return this._INamed_name;
    }

    private _wiredUp: boolean = false;
    private ensureWiredUp() {
        if (this._wiredUp) {
            return;
        }
        this._language.havingEntities(this._String, this._Boolean, this._Integer, this._JSON, this._Node, this._INamed);
        this._INamed.havingFeatures(this._INamed_name);
        this._INamed_name.ofType(this._String);
        this._wiredUp = true;
    }

    factory(_receiveDelta?: DeltaReceiver): NodeBaseFactory {
        return (classifier: Classifier, _id: LionWebId) => {
            const {language} = classifier;
            throw new Error(`can't instantiate ${classifier.name} (key=${classifier.key}): classifier is not known in language ${language.name} (key=${language.key}, version=${language.version})`);
        }
    }

    enumLiteralFrom<EnumType>(enumerationLiteral: EnumerationLiteral): EnumType {
        const {enumeration} = enumerationLiteral;
        const {language} = enumeration;
        throw new Error(`enumeration with key ${enumeration.key} is not known in language ${language.name} (key=${language.key}, version=${language.version})`);
    }

    public static readonly INSTANCE = new LionCore_builtinsBase();
}


export type String = string;

export type Boolean = boolean;

export type Integer = number;

export type JSON = unknown;

export abstract class Node extends NodeBase {
}

export interface INamed extends INodeBase {
    name: string;
}

