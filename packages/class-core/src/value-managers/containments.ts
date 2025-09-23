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

import { Containment } from "@lionweb/core"
import { action, observable } from "mobx"

import { INodeBase } from "../base-types.js"
import {
    ChildAddedDelta,
    ChildDeletedDelta,
    ChildMovedAndReplacedFromOtherContainmentDelta,
    ChildMovedAndReplacedFromOtherContainmentInSameParentDelta,
    ChildMovedAndReplacedInSameContainmentDelta,
    ChildMovedFromOtherContainmentDelta,
    ChildMovedFromOtherContainmentInSameParentDelta,
    ChildMovedInSameContainmentDelta,
    ChildReplacedDelta
} from "../deltas/index.js"
import { checkIndex, FeatureValueManager } from "./base.js"


/**
 * An instance manages the value of a particular containment feature on a particular instance of a classifier.
 */
export abstract class ContainmentValueManager<T extends INodeBase> extends FeatureValueManager<Containment> {

    get containment(): Containment {
        return this.feature;
    }

    abstract getDirectly(): T | undefined | (T | undefined)[];

    /**
     * Adds the given child to the containment.
     * For a single-valued containment, this assumes that it contained no child before,
     * or else it throws.
     */
    abstract addDirectly(newChild: T): void;

}


export abstract class SingleContainmentValueManager<T extends INodeBase> extends ContainmentValueManager<T> {

    protected constructor(containment: Containment, container: INodeBase) {
        super(containment, container);
        this.checkMultiple(false);
    }

    private readonly child = observable.box<T | undefined>(undefined, {deep: false});

    getDirectly(): T | undefined {
        return this.child.get();
    }

    isSet(): boolean {
        return this.child.get() !== undefined;
    }

    @action setDirectly(newChild: T | undefined) {
        this.child.set(newChild);
    }

    @action addDirectly(newChild: T) {
        const oldChild = this.getDirectly();
        if (oldChild !== undefined) {
            throw new Error(`replacing a child using addDirectly on a value manager for a single-valued containment isn't allowed`);    // TODO  unit test this
        }
        this.child.set(newChild);
    }

    @action replaceWith(movedChild: T) {
        const replacedChild = this.getDirectly();
        if (replacedChild === undefined) {
            // not a proper replace, but an add-set => delegate to regular setter (— unfortunately, through necessarily “unfolding the hierarchy”):
            if (this instanceof OptionalSingleContainmentValueManager) {
                this.set(movedChild);
            }
            if (this instanceof RequiredSingleContainmentValueManager) {
                this.set(movedChild);
            }
        } else {
            if (replacedChild === movedChild) {
                // do nothing: nothing's changed
            } else {
                if (movedChild.parent === undefined) {
                    this.emitDelta(() => new ChildReplacedDelta(this.container, this.feature, 0, replacedChild, movedChild));
                } else {
                    if (movedChild.parent === this.container) {
                        if (movedChild.containment === this.containment) {
                            this.emitDelta(() => new ChildMovedAndReplacedInSameContainmentDelta(this.container, this.containment, 0, 0, movedChild, replacedChild));
                        } else {
                            const oldIndex = removeFromContainment(replacedChild);
                            this.emitDelta(() => new ChildMovedAndReplacedFromOtherContainmentInSameParentDelta(this.container, movedChild.containment!, oldIndex, this.containment, 0, movedChild, replacedChild));
                        }
                    } else {
                        const oldIndex = removeFromContainment(replacedChild);
                        this.emitDelta(() => new ChildMovedAndReplacedFromOtherContainmentDelta(this.container, this.containment, 0, movedChild, movedChild.parent!, movedChild.containment!, oldIndex, replacedChild));
                    }
                }
                this.setDirectly(movedChild);
                movedChild.attachTo(this.container, this.containment);
                replacedChild.detach();
            }
        }
    }

}


export class OptionalSingleContainmentValueManager<T extends INodeBase> extends SingleContainmentValueManager<T> {

    constructor(containment: Containment, container: INodeBase) {
        super(containment, container);
        this.checkRequired(false);
    }

    get(): T | undefined {
        return this.getDirectly();
    }

    @action set(newChild: T | undefined) {
        const oldChild = this.getDirectly();
        if (oldChild === undefined) {
            if (newChild === undefined) {
                // do nothing: nothing's changed
            } else {
                if (newChild.parent && newChild.containment) {
                    const oldParent = newChild.parent;
                    removeFromContainment(newChild);
                    this.emitDelta(() => new ChildMovedFromOtherContainmentDelta(oldParent, newChild.containment!, 0, this.container, this.feature, 0, newChild));
                } else {
                    this.emitDelta(() => new ChildAddedDelta(this.container, this.feature, 0, newChild));
                }
                this.setDirectly(newChild);
                newChild.attachTo(this.container, this.feature);
            }
        } else {
            if (newChild === undefined) {
                oldChild.detach();
                this.setDirectly(undefined);
                this.emitDelta(() => new ChildDeletedDelta(this.container, this.feature, 0, oldChild));
            } else {
                if (oldChild === newChild) {
                    // do nothing: nothing's changed
                } else {
                    // FIXME  this could emit 2 deltas where it should be a single ChildReplaced-delta
                    if (oldChild.parent && oldChild.containment && oldChild.parent === this.container && oldChild.containment === this.feature) {
                        // FIXME  oldChild.parent COULD be this.container
                        this.emitDelta(() => new ChildDeletedDelta(this.container, this.feature, 0, oldChild));
                    }
                    oldChild.detach();
                    if (newChild.parent && newChild.containment) {
                        removeFromContainment(newChild);
                    }
                    this.setDirectly(newChild);
                    newChild.attachTo(this.container, this.feature);
                    this.emitDelta(() => new ChildReplacedDelta(this.container, this.feature, 0, oldChild, newChild));
                }
            }
        }
    }

}


export class RequiredSingleContainmentValueManager<T extends INodeBase> extends SingleContainmentValueManager<T> {

    constructor(containment: Containment, container: INodeBase) {
        super(containment, container);
        this.checkRequired(true);
    }

    get(): T {
        const child = this.getDirectly();
        if (child === undefined) {
            this.throwOnReadOfUnset();
        }
        return child;
    }

    @action set(newChild: T | undefined) {
        const oldChild = this.getDirectly();
        if (oldChild === undefined) {
            if (newChild === undefined) {
                // do nothing: nothing's changed
            } else {
                if (newChild.parent && newChild.containment) {
                    const oldParent = newChild.parent;
                    removeFromContainment(newChild);
                    this.emitDelta(() => new ChildMovedFromOtherContainmentDelta(oldParent, newChild.containment!, 0, this.container, this.feature, 0, newChild));
                } else {
                    this.emitDelta(() => new ChildAddedDelta(this.container, this.feature, 0, newChild));
                }
                this.setDirectly(newChild);
                newChild.attachTo(this.container, this.feature);
            }
        } else {
            if (newChild === undefined) {
                this.throwOnUnset();
            } else {
                if (oldChild === newChild) {
                    // do nothing: nothing's changed
                } else {
                    if (oldChild.parent && oldChild.containment && oldChild.parent === this.container && oldChild.containment === this.feature) {
                        // FIXME  oldChild.parent COULD be this.container
                        this.emitDelta(() => new ChildDeletedDelta(this.container, this.feature, 0, oldChild));
                    }
                    oldChild.detach();
                    if (newChild.parent && newChild.containment) {
                        removeFromContainment(newChild);
                    }
                    this.setDirectly(newChild);
                    newChild.attachTo(this.container, this.feature);
                    this.emitDelta(() => new ChildReplacedDelta(this.container, this.feature, 0, oldChild, newChild));
                }
            }
        }
    }

}


export abstract class MultiContainmentValueManager<T extends INodeBase> extends ContainmentValueManager<T> {

    protected constructor(containment: Containment, container: INodeBase) {
        super(containment, container);
        this.checkMultiple(true);
    }

    private readonly children = observable.array<T>([], {deep: false});

    getDirectly(): T[] {
        return this.children;
    }

    get(): T[] {
        return this.getDirectly().slice();
    }

    isSet(): boolean {
        return this.children.length > 0;
    }

    @action addDirectly(newChild: T) {
        this.children.push(newChild);
    }

    @action add(newChild: T): void {
        this.insertAtIndex(newChild, this.getDirectly().length);
    }

    @action insertAtIndexDirectly(newChild: T, index: number) {
        checkIndex(index, this.children.length, true);
        this.children.splice(index, 0, newChild);
    }

    @action insertAtIndex(newChild: T, newIndex: number) {
        if (newChild.parent === undefined) {
            this.insertAtIndexDirectly(newChild, newIndex);
            newChild.attachTo(this.container, this.containment);
            this.emitDelta(() => new ChildAddedDelta(this.container, this.containment, newIndex, newChild));
        } else {
            if (newChild.parent === this.container) {
                if (newChild.containment === this.containment) {
                    const oldIndex = this.children.indexOf(newChild);
                    this.moveDirectly(oldIndex, newIndex);
                    this.emitDelta(() => new ChildMovedInSameContainmentDelta(this.container, this.containment, oldIndex, newIndex, newChild));
                } else {
                    const oldIndex = removeFromContainment(newChild);
                    checkIndex(newIndex, this.children.length, true);
                    this.insertAtIndexDirectly(newChild, newIndex);
                    this.emitDelta(() => new ChildMovedFromOtherContainmentInSameParentDelta(this.container, newChild.containment!, oldIndex, newChild, this.containment, newIndex));
                    newChild.attachTo(this.container, this.containment);
                }
            } else {
                const oldIndex = removeFromContainment(newChild);
                this.insertAtIndexDirectly(newChild, newIndex);
                this.emitDelta(() => new ChildMovedFromOtherContainmentDelta(newChild.parent!, newChild.containment!, oldIndex, this.container, this.containment, newIndex, newChild));
                newChild.attachTo(this.container, this.containment);
            }
        }
    }

    @action removeDirectly(childToRemove: T): number {
        const children = this.getDirectly();
        const index = children.indexOf(childToRemove);
        if (index > -1) {
            children.splice(index, 1);
            return index;
        }
        return -1;
    }

    @action removeAtIndexDirectly(index: number) {
        checkIndex(index, this.children.length, false);
        this.getDirectly().splice(index, 1);
    }

    @action moveDirectly(oldIndex: number, newIndex: number): T | undefined {
        checkIndex(oldIndex, this.children.length, false);
        checkIndex(newIndex, this.children.length, false);
        if (oldIndex !== newIndex) {
            const [child] = this.children.splice(oldIndex, 1);
            this.children.splice(newIndex, 0, child);
            return child;
        }
        return undefined;
    }

    @action move(oldIndex: number, newIndex: number) {
        const child = this.moveDirectly(oldIndex, newIndex);
        if (child !== undefined) {
            this.emitDelta(() => new ChildMovedInSameContainmentDelta(this.container, this.containment, oldIndex, newIndex, child));
        }
    }

    @action replaceAtIndex(movedChild: T, newIndex: number) {
        checkIndex(newIndex, this.children.length, false);
        if (movedChild.parent === undefined) {
            throw new Error(`a child-to-move (id=${movedChild.id}) must already be contained`);
        }
        const replacedChild = this.children[newIndex];
        if (replacedChild === movedChild) {
            // do nothing: nothing's changed
        } else {
            this.children.splice(newIndex, 1, movedChild);
            if (replacedChild.parent !== undefined) {
                const oldValueManager = replacedChild.parent.getContainmentValueManager(replacedChild.containment!);
                const oldIndex = oldValueManager instanceof SingleContainmentValueManager
                    ? 0
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    : (oldValueManager as MultiContainmentValueManager<any>).children.indexOf(replacedChild);
                if (replacedChild.parent === movedChild.parent) {
                    if (replacedChild.containment === movedChild.containment) {
                        this.emitDelta(() => new ChildMovedAndReplacedInSameContainmentDelta(this.container, this.containment, oldIndex, newIndex, movedChild, replacedChild));
                    } else {
                        this.emitDelta(() => new ChildMovedAndReplacedFromOtherContainmentInSameParentDelta(this.container, replacedChild.containment!, oldIndex, this.containment, newIndex, movedChild, replacedChild));
                    }
                } else {
                    this.emitDelta(() => new ChildMovedAndReplacedFromOtherContainmentDelta(this.container, this.containment, newIndex, movedChild, movedChild.parent!, movedChild.containment!, oldIndex, replacedChild));
                }
                replacedChild.detach();
            } else {
                // not a move+replace, but a regular replace instead:
                this.emitDelta(() => new ChildReplacedDelta(this.container, this.containment, newIndex, replacedChild, movedChild));
            }
            movedChild.attachTo(this.container, this.containment);
        }
    }

}


export class OptionalMultiContainmentValueManager<T extends INodeBase> extends MultiContainmentValueManager<T> {

    constructor(containment: Containment, container: INodeBase) {
        super(containment, container);
        this.checkRequired(false);
    }

    @action remove(childToRemove: T) {
        const children = this.getDirectly();
        const index = children.indexOf(childToRemove);
        if (index > -1) {
            children.splice(index, 1);
            childToRemove.detach();
            this.emitDelta(() => new ChildDeletedDelta(this.container, this.containment, index, childToRemove));
        }
    }

}


export class RequiredMultiContainmentValueManager<T extends INodeBase> extends MultiContainmentValueManager<T> {

    constructor(containment: Containment, container: INodeBase) {
        super(containment, container);
        this.checkRequired(true);
    }

    get(): T[] {
        const children = this.getDirectly();
        if (children.length === 0) {
            this.throwOnReadOfUnset();
        }
        return children;
    }

    @action remove(childToRemove: T) {
        const children = this.getDirectly();
        const index = children.indexOf(childToRemove);
        if (index > -1) {
            if (children.length === 1) {
                this.throwOnUnset();
            }
            children.splice(index, 1);
            childToRemove.detach();
            this.emitDelta(() => new ChildDeletedDelta(this.container, this.containment, index, childToRemove));
        }
    }

}

/**
 * Removes the given child node from its containment, and returns the containment index it had before removal.
 */
const removeFromContainment = (child: INodeBase): number => {
    if (child.parent === undefined) {
        throw new Error(`can't remove an orphan from its parent`)
    }
    if (child.containment === undefined) {
        throw new Error(`can't remove an orphan from its containing feature`)
    }
    if (child.containment === null) {
        throw new Error(`can't remove an annotation`)
    }
    const valueManager = child.parent.getContainmentValueManager(child.containment)
    if (valueManager instanceof SingleContainmentValueManager) {
        valueManager.setDirectly(undefined)
        return 0
    } else if (valueManager instanceof MultiContainmentValueManager) {
        return valueManager.removeDirectly(child)
    } else {
        throw new Error(`don't know how to remove a child that's contained through a value manager of type ${valueManager.constructor.name}`)
    }
}

