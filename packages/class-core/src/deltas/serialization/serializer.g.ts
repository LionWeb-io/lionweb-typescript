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

import { metaPointerFor } from "@lionweb/core";
import { IDelta } from "../base.js";
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
} from "../types.g.js";
import {
    AnnotationAddedSerializedDelta,
    AnnotationDeletedSerializedDelta,
    AnnotationMovedFromOtherParentSerializedDelta,
    AnnotationMovedInSameParentSerializedDelta,
    AnnotationReplacedSerializedDelta,
    ChildAddedSerializedDelta,
    ChildDeletedSerializedDelta,
    ChildMovedInSameContainmentSerializedDelta,
    ChildMovedSerializedDelta,
    ChildReplacedSerializedDelta,
    NoOpSerializedDelta,
    PropertyAddedSerializedDelta,
    PropertyChangedSerializedDelta,
    PropertyDeletedSerializedDelta,
    ReferenceAddedSerializedDelta,
    ReferenceDeletedSerializedDelta,
    ReferenceMovedInSameReferenceSerializedDelta,
    ReferenceMovedSerializedDelta,
    ReferenceReplacedSerializedDelta
} from "./types.g.js";
import { idFrom, serializePropertyValue } from "./serializer-helpers.js";
import { serializeNodeBases } from "../../serializer.js";


export const serializeDelta = (delta: IDelta) => {
    if (delta instanceof NoOpDelta) {
        return {
            kind: "NoOp"
        } as NoOpSerializedDelta;
    }

    if (delta instanceof PropertyAddedDelta) {
        return {
            kind: "PropertyAdded",
            container: delta.container.id,
            property: metaPointerFor(delta.property),
            value: serializePropertyValue(delta.value, delta.property)
        } as PropertyAddedSerializedDelta;
    }

    if (delta instanceof PropertyDeletedDelta) {
        return {
            kind: "PropertyDeleted",
            container: delta.container.id,
            property: metaPointerFor(delta.property),
            oldValue: serializePropertyValue(delta.oldValue, delta.property)
        } as PropertyDeletedSerializedDelta;
    }

    if (delta instanceof PropertyChangedDelta) {
        return {
            kind: "PropertyChanged",
            container: delta.container.id,
            property: metaPointerFor(delta.property),
            oldValue: serializePropertyValue(delta.oldValue, delta.property),
            newValue: serializePropertyValue(delta.newValue, delta.property)
        } as PropertyChangedSerializedDelta;
    }

    if (delta instanceof ChildAddedDelta) {
        return {
            kind: "ChildAdded",
            parent: delta.parent.id,
            containment: metaPointerFor(delta.containment),
            index: delta.index,
            newChild: delta.newChild.id,
            newNodes: serializeNodeBases([delta.newChild])
        } as ChildAddedSerializedDelta;
    }

    if (delta instanceof ChildDeletedDelta) {
        return {
            kind: "ChildDeleted",
            parent: delta.parent.id,
            containment: metaPointerFor(delta.containment),
            index: delta.index,
            deletedChild: delta.deletedChild.id,
            deletedNodes: serializeNodeBases([delta.deletedChild])
        } as ChildDeletedSerializedDelta;
    }

    if (delta instanceof ChildReplacedDelta) {
        return {
            kind: "ChildReplaced",
            parent: delta.parent.id,
            containment: metaPointerFor(delta.containment),
            index: delta.index,
            replacedChild: delta.replacedChild.id,
            replacedNodes: serializeNodeBases([delta.replacedChild]),
            newChild: delta.newChild.id,
            newNodes: serializeNodeBases([delta.newChild])
        } as ChildReplacedSerializedDelta;
    }

    if (delta instanceof ChildMovedDelta) {
        return {
            kind: "ChildMoved",
            oldParent: delta.oldParent.id,
            oldContainment: metaPointerFor(delta.oldContainment),
            oldIndex: delta.oldIndex,
            newParent: delta.newParent.id,
            newContainment: metaPointerFor(delta.newContainment),
            newIndex: delta.newIndex,
            child: delta.child.id
        } as ChildMovedSerializedDelta;
    }

    if (delta instanceof ChildMovedInSameContainmentDelta) {
        return {
            kind: "ChildMovedInSameContainment",
            parent: delta.parent.id,
            containment: metaPointerFor(delta.containment),
            oldIndex: delta.oldIndex,
            newIndex: delta.newIndex,
            child: delta.child.id
        } as ChildMovedInSameContainmentSerializedDelta;
    }

    if (delta instanceof ReferenceAddedDelta) {
        return {
            kind: "ReferenceAdded",
            container: delta.container.id,
            reference: metaPointerFor(delta.reference),
            index: delta.index,
            newTarget: idFrom(delta.newTarget)
        } as ReferenceAddedSerializedDelta;
    }

    if (delta instanceof ReferenceDeletedDelta) {
        return {
            kind: "ReferenceDeleted",
            container: delta.container.id,
            reference: metaPointerFor(delta.reference),
            index: delta.index,
            deletedTarget: idFrom(delta.deletedTarget)
        } as ReferenceDeletedSerializedDelta;
    }

    if (delta instanceof ReferenceReplacedDelta) {
        return {
            kind: "ReferenceReplaced",
            container: delta.container.id,
            reference: metaPointerFor(delta.reference),
            index: delta.index,
            replacedTarget: idFrom(delta.replacedTarget),
            newTarget: idFrom(delta.newTarget)
        } as ReferenceReplacedSerializedDelta;
    }

    if (delta instanceof ReferenceMovedDelta) {
        return {
            kind: "ReferenceMoved",
            oldContainer: delta.oldContainer.id,
            oldReference: metaPointerFor(delta.oldReference),
            oldIndex: delta.oldIndex,
            newContainer: delta.newContainer.id,
            newReference: metaPointerFor(delta.newReference),
            newIndex: delta.newIndex,
            target: idFrom(delta.target)
        } as ReferenceMovedSerializedDelta;
    }

    if (delta instanceof ReferenceMovedInSameReferenceDelta) {
        return {
            kind: "ReferenceMovedInSameReference",
            container: delta.container.id,
            reference: metaPointerFor(delta.reference),
            oldIndex: delta.oldIndex,
            newIndex: delta.newIndex,
            target: idFrom(delta.target)
        } as ReferenceMovedInSameReferenceSerializedDelta;
    }

    if (delta instanceof AnnotationAddedDelta) {
        return {
            kind: "AnnotationAdded",
            parent: delta.parent.id,
            index: delta.index,
            newAnnotation: delta.newAnnotation.id,
            newAnnotationNodes: serializeNodeBases([delta.newAnnotation])
        } as AnnotationAddedSerializedDelta;
    }

    if (delta instanceof AnnotationDeletedDelta) {
        return {
            kind: "AnnotationDeleted",
            parent: delta.parent.id,
            index: delta.index,
            deletedAnnotation: delta.deletedAnnotation.id,
            deletedAnnotationNodes: serializeNodeBases([delta.deletedAnnotation])
        } as AnnotationDeletedSerializedDelta;
    }

    if (delta instanceof AnnotationReplacedDelta) {
        return {
            kind: "AnnotationReplaced",
            parent: delta.parent.id,
            index: delta.index,
            replacedAnnotation: delta.replacedAnnotation.id,
            replacedAnnotationNodes: serializeNodeBases([delta.replacedAnnotation]),
            newAnnotation: delta.newAnnotation.id,
            newAnnotationNodes: serializeNodeBases([delta.newAnnotation])
        } as AnnotationReplacedSerializedDelta;
    }

    if (delta instanceof AnnotationMovedFromOtherParentDelta) {
        return {
            kind: "AnnotationMovedFromOtherParent",
            oldParent: delta.oldParent.id,
            oldIndex: delta.oldIndex,
            newParent: delta.newParent.id,
            newIndex: delta.newIndex,
            movedAnnotation: delta.movedAnnotation.id
        } as AnnotationMovedFromOtherParentSerializedDelta;
    }

    if (delta instanceof AnnotationMovedInSameParentDelta) {
        return {
            kind: "AnnotationMovedInSameParent",
            parent: delta.parent.id,
            oldIndex: delta.oldIndex,
            newIndex: delta.newIndex,
            movedAnnotation: delta.movedAnnotation.id
        } as AnnotationMovedInSameParentSerializedDelta;
    }

    throw new Error(`serialization of delta of class ${delta.constructor.name} not implemented`);
}
