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

import { Feature, featureMetaType, Link } from "@lionweb/core"
import { INodeBase } from "../base-types.js"
import { IDelta } from "../deltas/index.js"


/**
 * Abstract super/base type for managers of values on classifiers.
 */
export abstract class ValueManager {

    protected constructor(protected readonly container: INodeBase) {
    }

    /**
     * Emits a delta if a {@link DeltaHandler} is registered with the container.
     * @param deltaThunk a thunk that generates the delta, and is only called when a delta handler is registered with the container.
     */
    emitDelta(deltaThunk: () => IDelta) {
        if (this.container.handleDelta) {
            this.container.handleDelta(deltaThunk());
        }
    }

}


/**
 * Abstract super/base type for managers of values of features on classifiers.
 * All subtypes have "<requiredness><multiplicity>ValueManager" as names,
 * where <requiredness> = "" (for abstract “inter-types”) or "Optional" or "Required",
 * and <multiplicity> = "Single" or "Multiple".
 */
export abstract class FeatureValueManager<FT extends Feature> extends ValueManager {

    protected constructor(protected readonly feature: FT, container: INodeBase) {
        super(container);
    }


    /**
     * Checks whether the feature's requiredness matches the expected one.
     */
    checkRequired(expectRequired: boolean) {
        if (this.feature.optional === expectRequired) { // (double negation)
            throw new Error(`${featureMetaType(this.feature).toLowerCase()} "${this.feature.name}" (with key="${this.feature.key}") should be ${expectRequired ? "required" : "optional"}`);
        }
    }

    /**
     * Checks whether the feature's multiplicity matches the expected one.
     */
    checkMultiple(expectMultiple: boolean) {
        if ((this.feature as unknown as Link).multiple !== expectMultiple) {
            throw new Error(`${featureMetaType(this.feature).toLowerCase()} "${this.feature.name}" (with key="${this.feature.key}") should be ${expectMultiple ? "multi" : "single"}-valued`);
        }
    }


    /**
     * @return whether the feature's value is (has been) set.
     */
    abstract isSet(): boolean;

    /**
     * @throws when the feature's value is unset, but has been attempted to read.
     */
    throwOnReadOfUnset(): never {
        throw new Error(`can't read required ${featureMetaType(this.feature).toLowerCase()} "${this.feature.name}" that's unset on instance of ${this.container.classifier.language.name}.${this.container.classifier.name} with id=${this.container.id}`);
    }

    /**
     * @throws when the feature's value has been attempted to unset, but the feature is required.
     */
    throwOnUnset(): never {
        throw new Error(`can't unset required ${featureMetaType(this.feature).toLowerCase()} "${this.feature.name}" on instance of ${this.container.classifier.language.name}.${this.container.classifier.name} with id=${this.container.id}`);
    }

}


/**
 * Checks whether the given index is valid within the given parameters of the context.
 * @param index the supposed index of an element to retrieve/insert at/to
 * @param nElements the number of elements in an array
 * @param inserting whether the intention is to insert an element to the array
 */
export const checkIndex = (index: number, nElements: number, inserting: boolean) => {
    if (!Number.isInteger(index)) {
        throw new Error(`an array index must be an integer, but got: ${index}`);
    }
    if (index < 0) {
        throw new Error(`an array index must be a non-negative integer, but got: ${index}`);
    }
    if (inserting) {
        if (index > nElements) {
            throw new Error(`the largest valid insert index for an array with ${nElements} element${nElements === 1 ? "": "s"} is ${nElements}, but got: ${index}`);
        }
    } else {
        if (nElements === 0) {
            throw new Error(`an empty array has no valid indices (got: ${index})`);
        } else if (index + 1 > nElements) {
            throw new Error(`the largest valid index for an array with ${nElements} element${nElements === 1 ? "": "s"} is ${nElements - 1}, but got: ${index}`);
        }
    }
}

