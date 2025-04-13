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

import { Reference, SingleRef } from "@lionweb/core"
import { action, observable } from "mobx"

import { INodeBase } from "../base-types.js"
import { ReferenceAddedDelta, ReferenceDeletedDelta, ReferenceMovedInSameReferenceDelta, ReferenceReplacedDelta } from "../deltas/index.js"
import { checkIndex, FeatureValueManager } from "./base.js"


/**
 * An instance manages the value of a particular reference feature on a particular instance of a classifier.
 */
export abstract class ReferenceValueManager<T extends INodeBase> extends FeatureValueManager<Reference> {

    get reference(): Reference {
        return this.feature;
    }

    abstract getDirectly(): (SingleRef<T> | undefined) | (SingleRef<T> | undefined)[];

    /**
     * Adds the given target to the reference.
     * For a single-valued reference, this replaces an already-present target.
     */
    abstract addDirectly(newTarget: SingleRef<T> | undefined): void;

}


export abstract class SingleReferenceValueManager<T extends INodeBase> extends ReferenceValueManager<T> {

    protected constructor(reference: Reference, container: INodeBase) {
        super(reference, container);
        this.checkMultiple(false);
    }

    private readonly target = observable.box<SingleRef<T> | undefined>(undefined, {deep: false});

    getDirectly(): SingleRef<T> | undefined {
        return this.target.get();
    }

    isSet(): boolean {
        return this.target.get() !== undefined;
    }

    @action setDirectly(newTarget: SingleRef<T> | undefined) {
        this.target.set(newTarget); // (this _replaces_ an already-set target value)
    }

    @action addDirectly(newTarget: SingleRef<T> | undefined) {
        this.setDirectly(newTarget);
    }

}


export class OptionalSingleReferenceValueManager<T extends INodeBase> extends SingleReferenceValueManager<T> {

    constructor(reference: Reference, container: INodeBase) {
        super(reference, container);
        this.checkRequired(false);
    }

    get(): SingleRef<T> | undefined {
        return this.getDirectly();
    }

    @action set(newTarget: SingleRef<T> | undefined) {
        const oldTarget = this.getDirectly();
        if (oldTarget === newTarget) {
            // do nothing as nothing changes
            return
        }
        if (newTarget === undefined) {
            this.addDirectly(undefined);
            if (oldTarget === undefined) {
                // (nothing)
            } else {
                this.emitDelta(() => new ReferenceDeletedDelta(this.container, this.reference, 0, oldTarget));
            }
        } else {
            this.addDirectly(newTarget);
            if (oldTarget === undefined) {
                this.emitDelta(() => new ReferenceAddedDelta(this.container, this.reference, 0, newTarget));
            } else {
                this.emitDelta(() => new ReferenceReplacedDelta(this.container, this.reference, 0, oldTarget, newTarget));
            }
        }
    }

}


export class RequiredSingleReferenceValueManager<T extends INodeBase> extends SingleReferenceValueManager<T> {

    constructor(reference: Reference, container: INodeBase) {
        super(reference, container);
        this.checkRequired(true);
    }

    get(): SingleRef<T> {
        const target = this.getDirectly();
        if (target === undefined) {
            this.throwOnReadOfUnset();
        }
        return target;
    }

    @action set(newTarget: SingleRef<T> | undefined) {
        const oldTarget = this.getDirectly();
        if (oldTarget === newTarget) {
            // do nothing as nothing changes
            return
        }
        if (newTarget === undefined) {
            this.throwOnUnset();
        } else {
            this.addDirectly(newTarget);
            if (oldTarget === undefined) {
                this.emitDelta(() => new ReferenceAddedDelta(this.container, this.reference, 0, newTarget));
            } else {
                this.emitDelta(() => new ReferenceReplacedDelta(this.container, this.reference, 0, oldTarget, newTarget));
            }
        }
    }

}


export abstract class MultiReferenceValueManager<T extends INodeBase> extends ReferenceValueManager<T> {

    protected constructor(reference: Reference, container: INodeBase) {
        super(reference, container);
        this.checkMultiple(true);
    }

    private readonly targets = observable.array<SingleRef<T>>([], {deep: false});

    getDirectly(): SingleRef<T>[] {
        return this.targets;
    }

    get(): SingleRef<T>[] {
        return this.getDirectly().slice();
    }

    isSet(): boolean {
        return this.targets.length > 0;
    }

    @action addDirectly(newTarget: SingleRef<T>) {
        this.targets.push(newTarget);
    }

    @action add(newTarget: SingleRef<T>) {
        this.insertAtIndex(newTarget, this.getDirectly().length);
    }

    @action insertAtIndexDirectly(newTarget: SingleRef<T>, index: number) {
        checkIndex(index, this.targets.length, true);
        this.targets.splice(index, 0, newTarget);
    }

    @action insertAtIndex(newTarget: SingleRef<T>, index: number) {
        this.insertAtIndexDirectly(newTarget, index);
        this.emitDelta(() => new ReferenceAddedDelta(this.container, this.reference, index, newTarget));
    }

    @action removeDirectly(targetToRemove: SingleRef<T>): number {
        const targets = this.getDirectly();
        const index = targets.findIndex((target) => target === targetToRemove);
        if (index > -1) {
            targets.splice(index, 1);
        }
        return index;
    }

    abstract remove(targetToRemove: SingleRef<T>): void;

    @action moveDirectly(oldIndex: number, newIndex: number): SingleRef<T> | undefined {
        checkIndex(oldIndex, this.targets.length, false);
        checkIndex(newIndex, this.targets.length, false);
        if (oldIndex !== newIndex) {
            const [target] = this.targets.splice(oldIndex, 1);
            this.targets.splice(newIndex, 0, target);
            return target;
        }
        return undefined;
    }

    @action move(oldIndex: number, newIndex: number) {
        const target = this.moveDirectly(oldIndex, newIndex);
        if (target !== undefined) {
            this.emitDelta(() => new ReferenceMovedInSameReferenceDelta(this.container, this.reference, oldIndex, newIndex, target));
        }
    }

}


export class OptionalMultiReferenceValueManager<T extends INodeBase> extends MultiReferenceValueManager<T> {

    constructor(reference: Reference, container: INodeBase) {
        super(reference, container);
        this.checkRequired(false);
    }

    @action remove(targetToRemove: SingleRef<T>) {
        const index = this.removeDirectly(targetToRemove);
        if (index > -1) {
            this.emitDelta(() => new ReferenceDeletedDelta(this.container, this.reference, index, targetToRemove));
        }
    }

}


export class RequiredMultiReferenceValueManager<T extends INodeBase> extends MultiReferenceValueManager<T> {

    constructor(reference: Reference, container: INodeBase) {
        super(reference, container);
        this.checkRequired(true);
    }

    get(): SingleRef<T>[] {
        const targets = this.getDirectly();
        if (targets.length === 0) {
            this.throwOnReadOfUnset();
        }
        return targets;
    }

    @action remove(targetToRemove: SingleRef<T>) {
        const targets = this.getDirectly();
        const index = targets.findIndex((target) => target === targetToRemove);
        if (index > -1) {
            if (targets.length === 1) {
                this.throwOnUnset();
            }
            targets.splice(index, 1);
            this.emitDelta(() => new ReferenceDeletedDelta(this.container, this.reference, index, targetToRemove));
        }
    }

}

