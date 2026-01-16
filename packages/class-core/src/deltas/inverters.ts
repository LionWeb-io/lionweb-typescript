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
    AnnotationMovedAndReplacedFromOtherParentDelta,
    AnnotationMovedAndReplacedInSameParentDelta,
    AnnotationMovedFromOtherParentDelta,
    AnnotationMovedInSameParentDelta,
    AnnotationReplacedDelta,
    ChildAddedDelta,
    ChildDeletedDelta,
    ChildMovedAndReplacedFromOtherContainmentDelta,
    ChildMovedAndReplacedFromOtherContainmentInSameParentDelta,
    ChildMovedAndReplacedInSameContainmentDelta,
    ChildMovedFromOtherContainmentDelta,
    ChildMovedFromOtherContainmentInSameParentDelta,
    ChildMovedInSameContainmentDelta,
    ChildReplacedDelta,
    CompositeDelta,
    NoOpDelta,
    PartitionAddedDelta,
    PartitionDeletedDelta,
    PropertyAddedDelta,
    PropertyChangedDelta,
    PropertyDeletedDelta,
    ReferenceAddedDelta,
    ReferenceChangedDelta,
    ReferenceDeletedDelta
} from "./types.g.js"
import { IDelta } from "./base.js"


/**
 * @return the inverted version of the given {@link IDelta delta}
 * in the sense that it undoes that delta after it has been applied.
 */
export const invertDelta = (delta: IDelta): IDelta => {
    if (delta instanceof PartitionAddedDelta) {
        return new PartitionDeletedDelta(delta.newPartition);
    }
    if (delta instanceof PartitionDeletedDelta) {
        return new PartitionAddedDelta(delta.deletedPartition);
    }
    if (delta instanceof PropertyAddedDelta) {
        return new PropertyDeletedDelta(delta.node, delta.property, delta.value);
    }
    if (delta instanceof PropertyDeletedDelta) {
        return new PropertyAddedDelta(delta.node, delta.property, delta.oldValue);
    }
    if (delta instanceof PropertyChangedDelta) {
        return new PropertyChangedDelta(delta.node, delta.property, delta.newValue, delta.oldValue);
    }
    if (delta instanceof ChildAddedDelta) {
        return new ChildDeletedDelta(delta.parent, delta.containment, delta.index, delta.newChild);
    }
    if (delta instanceof ChildDeletedDelta) {
        return new ChildAddedDelta(delta.parent, delta.containment, delta.index, delta.deletedChild);
    }
    if (delta instanceof ChildReplacedDelta) {
        return new ChildReplacedDelta(delta.parent, delta.containment, delta.index, delta.newChild, delta.replacedChild);
    }
    if (delta instanceof ChildMovedFromOtherContainmentDelta) {
        return new ChildMovedFromOtherContainmentDelta(delta.newParent, delta.newContainment, delta.newIndex, delta.oldParent, delta.oldContainment, delta.oldIndex, delta.movedChild);
    }
    if (delta instanceof ChildMovedFromOtherContainmentInSameParentDelta) {
        return new ChildMovedFromOtherContainmentInSameParentDelta(delta.parent, delta.newContainment, delta.newIndex, delta.movedChild, delta.oldContainment, delta.oldIndex);
    }
    if (delta instanceof ChildMovedInSameContainmentDelta) {
        return new ChildMovedInSameContainmentDelta(delta.parent, delta.containment, delta.newIndex, delta.oldIndex, delta.movedChild);
    }
    if (delta instanceof ChildMovedAndReplacedFromOtherContainmentDelta) {
        return new CompositeDelta([
            new ChildMovedFromOtherContainmentDelta(delta.newParent, delta.newContainment, delta.newIndex, delta.oldParent, delta.oldContainment, delta.oldIndex, delta.movedChild),
            new ChildAddedDelta(delta.newParent, delta.newContainment, delta.newIndex, delta.replacedChild)
        ]);
    }
    if (delta instanceof ChildMovedAndReplacedFromOtherContainmentInSameParentDelta) {
        return new CompositeDelta([
            new ChildMovedFromOtherContainmentInSameParentDelta(delta.parent, delta.newContainment, delta.newIndex, delta.movedChild, delta.oldContainment, delta.oldIndex),
            new ChildAddedDelta(delta.parent, delta.newContainment, delta.newIndex, delta.replacedChild)
        ]);
    }
    if (delta instanceof ChildMovedAndReplacedInSameContainmentDelta) {
        return new CompositeDelta([
            new ChildMovedInSameContainmentDelta(delta.parent, delta.containment, delta.newIndex, delta.oldIndex, delta.movedChild),
            new ChildAddedDelta(delta.parent, delta.containment, delta.newIndex, delta.replacedChild)
        ]);
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
    if (delta instanceof AnnotationMovedAndReplacedFromOtherParentDelta) {
        return new CompositeDelta([
            new AnnotationMovedFromOtherParentDelta(delta.newParent, delta.newIndex, delta.oldParent, delta.oldIndex, delta.movedAnnotation),
            new AnnotationAddedDelta(delta.newParent, delta.newIndex, delta.replacedAnnotation)
        ]);
    }
    if (delta instanceof AnnotationMovedAndReplacedInSameParentDelta) {
        return new CompositeDelta([
            new AnnotationMovedInSameParentDelta(delta.parent, delta.newIndex, delta.oldIndex, delta.movedAnnotation),
            new AnnotationAddedDelta(delta.parent, delta.newIndex, delta.replacedAnnotation)
        ]);
    }
    if (delta instanceof ReferenceAddedDelta) {
        return new ReferenceDeletedDelta(delta.parent, delta.reference, delta.index, delta.newTarget);
    }
    if (delta instanceof ReferenceDeletedDelta) {
        return new ReferenceAddedDelta(delta.parent, delta.reference, delta.index, delta.deletedTarget);
    }
    if (delta instanceof ReferenceChangedDelta) {
        return new ReferenceChangedDelta(delta.parent, delta.reference, delta.index, delta.oldTarget, delta.newTarget);
    }
    if (delta instanceof CompositeDelta) {
        return new CompositeDelta(delta.parts.map(invertDelta));
    }
    if (delta instanceof NoOpDelta) {
        return delta;
    }

    throw new Error(`inversion of delta of class ${delta.constructor.name} not implemented`);
}

