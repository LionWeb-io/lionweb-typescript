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

import { Property } from "@lionweb/core"
import { action, IObservableValue, observable } from "mobx"
import { INodeBase } from "../base-types.js"
import { PropertyAddedDelta, PropertyChangedDelta, PropertyDeletedDelta } from "../deltas/index.js"

import { FeatureValueManager } from "./base.js"


/**
 * An instance manages the value of a particular property feature on a particular instance of a classifier.
 */
export abstract class PropertyValueManager<T> extends FeatureValueManager<Property> {

    private readonly observableValue: IObservableValue<T | undefined> = observable.box<T | undefined>(undefined, {deep: false});
        // TODO  could replace T with a sum types of the exact types we know a property's value can have

    get property(): Property {
        return this.feature;
    }

    getDirectly(): T | undefined {
        return this.observableValue.get();
    }

    @action setDirectly(newValue: T | undefined) {
        this.observableValue.set(newValue);
    }

    isSet(): boolean {
        return this.observableValue.get() !== undefined;
    }

}


export class RequiredPropertyValueManager<T> extends PropertyValueManager<T> {

    constructor(property: Property, container: INodeBase) {
        super(property, container);
        this.checkRequired(true);
    }

    get(): T {
        const value = this.getDirectly();
        if (value === undefined) {
            this.throwOnReadOfUnset();
        }
        return value;
    }

    @action set(newValue: T) {
        const oldValue = this.getDirectly();
        if (oldValue === newValue) {
            return
        }
        this.setDirectly(newValue);
        if (oldValue === undefined) {
            if (newValue === undefined) {
                // (doesn't happen)
            } else {
                this.emitDelta(() => new PropertyAddedDelta(this.container, this.property, newValue));
            }
        } else {
            if (newValue === undefined) {
                this.throwOnUnset();
            } else {
                this.emitDelta(() => new PropertyChangedDelta(this.container, this.property, oldValue, newValue));
            }
        }
    }

}


export class OptionalPropertyValueManager<T> extends PropertyValueManager<T> {

    constructor(property: Property, container: INodeBase) {
        super(property, container);
        this.checkRequired(false);
    }

    get(): T | undefined {
        return this.getDirectly();
    }

    @action set(newValue: T | undefined) {
        const oldValue = this.getDirectly();
        if (oldValue === undefined) {
            if (newValue === undefined) {
                // do nothing
            } else {
                this.setDirectly(newValue);
                this.emitDelta(() => new PropertyAddedDelta(this.container, this.property, newValue));
            }
        } else {
            if (newValue === undefined) {
                this.setDirectly(undefined);
                this.emitDelta(() => new PropertyDeletedDelta(this.container, this.property, oldValue));
            } else {
                if (oldValue !== newValue) {
                    this.setDirectly(newValue);
                    this.emitDelta(() => new PropertyChangedDelta(this.container, this.property, oldValue, newValue));
                } else {
                    // do nothing
                }
            }
        }
    }

}

