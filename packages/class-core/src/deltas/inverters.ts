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
    AnnotationAddedDelta,
    AnnotationDeletedDelta,
    AnnotationMovedFromOtherParentDelta,
    AnnotationMovedInSameParentDelta,
    AnnotationReplacedDelta,
    ChildAddedDelta,
    ChildDeletedDelta,
    ChildMovedDelta,
    ChildMovedInSameContainmentDelta,
    ChildReplacedDelta,
    NoOpDelta,
    PropertyAddedDelta,
    PropertyChangedDelta,
    PropertyDeletedDelta,
    ReferenceAddedDelta,
    ReferenceDeletedDelta,
    ReferenceMovedDelta,
    ReferenceMovedInSameReferenceDelta,
    ReferenceReplacedDelta
} from "./types.g.js"
import { IDelta } from "./base.js"


/**
 * @return the inverted version of the given {@link IDelta delta}
 * in the sense that it undoes that delta after it has been applied.
 */
export const invertDelta = (delta: IDelta): IDelta => {
    if (delta instanceof NoOpDelta) {
        return delta;
    }

    if (delta instanceof PropertyAddedDelta) {
        return new PropertyDeletedDelta(delta.container, delta.property, delta.value);
    }
    if (delta instanceof PropertyChangedDelta) {
        return new PropertyChangedDelta(delta.container, delta.property, delta.newValue, delta.oldValue);
    }
    if (delta instanceof PropertyDeletedDelta) {
        return new PropertyAddedDelta(delta.container, delta.property, delta.oldValue);
    }

    if (delta instanceof ChildAddedDelta) {
        return new ChildDeletedDelta(delta.parent, delta.containment, delta.index, delta.newChild);
    }
    if (delta instanceof ChildReplacedDelta) {
        return new ChildReplacedDelta(delta.parent, delta.containment, delta.index, delta.newChild, delta.replacedChild);
    }
    if (delta instanceof ChildMovedDelta) {
        return new ChildMovedDelta(delta.newParent, delta.newContainment, delta.newIndex, delta.oldParent, delta.oldContainment, delta.oldIndex, delta.child);
    }
    if (delta instanceof ChildMovedInSameContainmentDelta) {
        return new ChildMovedInSameContainmentDelta(delta.parent, delta.containment, delta.newIndex, delta.oldIndex, delta.child);
    }
    if (delta instanceof ChildDeletedDelta) {
        return new ChildAddedDelta(delta.parent, delta.containment, delta.index, delta.deletedChild);
    }

    if (delta instanceof ReferenceAddedDelta) {
        return new ReferenceDeletedDelta(delta.container, delta.reference, delta.index, delta.newTarget);
    }
    if (delta instanceof ReferenceReplacedDelta) {
        return new ReferenceReplacedDelta(delta.container, delta.reference, delta.index, delta.newTarget, delta.replacedTarget);
    }
    if (delta instanceof ReferenceMovedDelta) {
        return new ReferenceMovedDelta(delta.newContainer, delta.newReference, delta.newIndex, delta.oldContainer, delta.oldReference, delta.oldIndex, delta.target);
    }
    if (delta instanceof ReferenceMovedInSameReferenceDelta) {
        return new ReferenceMovedInSameReferenceDelta(delta.container, delta.reference, delta.newIndex, delta.oldIndex, delta.target);
    }
    if (delta instanceof ReferenceDeletedDelta) {
        return new ReferenceAddedDelta(delta.container, delta.reference, delta.index, delta.deletedTarget);
    }

    if (delta instanceof AnnotationAddedDelta) {
        return new AnnotationDeletedDelta(delta.parent, delta.index, delta.newAnnotation);
    }
    if (delta instanceof AnnotationDeletedDelta) {
        return new AnnotationAddedDelta(delta.parent, delta.index, delta.deletedAnnotation);
    }
    if (delta instanceof AnnotationReplacedDelta) {
        return new AnnotationReplacedDelta(delta.parent, delta.index, delta.newAnnotation, delta.replacedAnnotation);
    }
    if (delta instanceof AnnotationMovedFromOtherParentDelta) {
        return new AnnotationMovedFromOtherParentDelta(delta.newParent, delta.newIndex, delta.oldParent, delta.oldIndex, delta.movedAnnotation);
    }
    if (delta instanceof AnnotationMovedInSameParentDelta) {
        return new AnnotationMovedInSameParentDelta(delta.parent, delta.newIndex, delta.oldIndex, delta.movedAnnotation);
    }

    throw new Error(`inversion of delta of class ${delta.constructor.name} not implemented`);
}

