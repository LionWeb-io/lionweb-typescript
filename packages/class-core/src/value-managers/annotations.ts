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

import { action, observable } from "mobx"

import { INodeBase, removeFromParent } from "../base-types.js"
import { checkIndex, ValueManager } from "./base.js"
import {
    AnnotationAddedDelta,
    AnnotationDeletedDelta,
    AnnotationMovedAndReplacedInSameParentDelta,
    AnnotationMovedFromOtherParentDelta,
    AnnotationMovedInSameParentDelta,
    AnnotationReplacedDelta
} from "../deltas/index.js"


/**
 * A value manager for annotations.
 * Annotations (of any type) are simply contained by a parent (which is an {@link INodeBase}),
 * not in the context of a(ny) {@link Feature feature}.
 */
export class AnnotationsValueManager extends ValueManager {

    constructor(container: INodeBase) {
        super(container);
    }

    private readonly annotations = observable.array<INodeBase>([], {deep: false});

    get(): INodeBase[] {
        return this.annotations.slice();
    }

    @action addDirectly(newAnnotation: INodeBase) {
        this.annotations.push(newAnnotation);
        newAnnotation.attachTo(this.container, null);
    }

    @action add(newAnnotation: INodeBase) {
        this.insertAtIndex(newAnnotation, this.annotations.length);
    }

    /**
     * @return `false` if the given `newAnnotation` wasn't contained before,
     *  otherwise an array tuple with the old – i.e.: previous – parent of the inserted annotation, and the index it was contained at.
     */
    @action insertAtIndexDirectly(newAnnotation: INodeBase, index: number): false | [oldParent: INodeBase, oldIndex: number] {
        checkIndex(index, this.annotations.length, true);
        this.annotations.splice(index, 0, newAnnotation);
        const oldParent = newAnnotation.parent;
        if (oldParent === undefined) {
            newAnnotation.attachTo(this.container, null);
            return false;
        } else {
            const oldIndex = removeFromParent(oldParent, newAnnotation);
            newAnnotation.attachTo(this.container, null);
            return [oldParent, oldIndex];
        }
    }

    @action insertAtIndex(newAnnotation: INodeBase, index: number) {
        const oldParentage = this.insertAtIndexDirectly(newAnnotation, index);
        if (oldParentage === false) {
            this.emitDelta(() => new AnnotationAddedDelta(this.container, index, newAnnotation));
        } else {
            this.emitDelta(() => new AnnotationMovedFromOtherParentDelta(oldParentage[0], oldParentage[1], this.container, index, newAnnotation));
        }
    }

    /**
     * @return the moved annotation, or `undefined` if the indices coincide.
     */
    @action moveDirectly(oldIndex: number, newIndex: number): INodeBase | undefined {
        checkIndex(oldIndex, this.annotations.length, false);
        checkIndex(newIndex, this.annotations.length, false);
        if (oldIndex !== newIndex) {
            const [annotation] = this.annotations.splice(oldIndex, 1);
            this.annotations.splice(newIndex, 0, annotation);
            return annotation;
        }
        return undefined;
    }

    @action move(oldIndex: number, newIndex: number) {
        const annotation = this.moveDirectly(oldIndex, newIndex);
        if (annotation !== undefined) {
            this.emitDelta(() => new AnnotationMovedInSameParentDelta(this.container, oldIndex, newIndex, annotation));
        }
    }

    /**
     * @return the replaced annotation.
     */
    @action replaceAtIndexDirectly(newAnnotation: INodeBase, index: number): INodeBase {
        checkIndex(index, this.annotations.length, false);
        const replacedAnnotation = this.annotations[index];
        this.annotations.splice(index, 1, newAnnotation);
        replacedAnnotation.detach();
        newAnnotation.attachTo(this.container, null);
        return replacedAnnotation;
    }

    @action replaceAtIndex(newAnnotation: INodeBase, index: number) {
        const replacedAnnotation = this.replaceAtIndexDirectly(newAnnotation, index);
        this.emitDelta(() => new AnnotationReplacedDelta(this.container, index, replacedAnnotation, newAnnotation));
    }

    /**
     * @return the moved and replaced annotations, as an array tuple.
     */
    @action moveAndReplaceAtIndexDirectly(oldIndex: number, newIndex: number): [INodeBase, INodeBase] | undefined {
        checkIndex(oldIndex, this.annotations.length, false);
        checkIndex(newIndex, this.annotations.length, false);
        if (oldIndex !== newIndex) {
            const movedAnnotation = this.annotations[oldIndex];
            const replacedAnnotation = this.annotations[newIndex];
            this.annotations[newIndex] = movedAnnotation;
            this.annotations.splice(oldIndex, 1);
            replacedAnnotation.detach();
            return [movedAnnotation, replacedAnnotation];
        }
        return undefined;
    }

    @action moveAndReplaceAtIndex(oldIndex: number, newIndex: number) {
        const participants = this.moveAndReplaceAtIndexDirectly(oldIndex, newIndex);
        if (participants !== undefined) {
            const [movedAnnotation, replacedAnnotation] = participants;
            this.emitDelta(() => new AnnotationMovedAndReplacedInSameParentDelta(this.container, oldIndex, newIndex, replacedAnnotation, movedAnnotation));
        }
    }

    @action removeDirectly(annotationToRemove: INodeBase): number {
        const index = this.annotations.indexOf(annotationToRemove);
        if (index > -1) {
            this.annotations.splice(index, 1);
        }
        annotationToRemove.detach();
        return index;
    }

    @action remove(annotationToRemove: INodeBase) {
        const removeIndex = this.removeDirectly(annotationToRemove);
        if (removeIndex > -1) {
            this.emitDelta(() => new AnnotationDeletedDelta(this.container, removeIndex, annotationToRemove));
        }
    }

}

