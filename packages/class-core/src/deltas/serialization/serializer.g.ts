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
    EntryMovedAndReplacedFromOtherReferenceDelta,
    EntryMovedAndReplacedFromOtherReferenceInSameParentDelta,
    EntryMovedAndReplacedInSameReferenceDelta,
    EntryMovedFromOtherReferenceDelta,
    EntryMovedFromOtherReferenceInSameParentDelta,
    EntryMovedInSameReferenceDelta,
    NoOpDelta,
    PartitionAddedDelta,
    PartitionDeletedDelta,
    PropertyAddedDelta,
    PropertyChangedDelta,
    PropertyDeletedDelta,
    ReferenceAddedDelta,
    ReferenceChangedDelta,
    ReferenceDeletedDelta
} from "../types.g.js";
import {
    AnnotationAddedSerializedDelta,
    AnnotationDeletedSerializedDelta,
    AnnotationMovedAndReplacedFromOtherParentSerializedDelta,
    AnnotationMovedAndReplacedInSameParentSerializedDelta,
    AnnotationMovedFromOtherParentSerializedDelta,
    AnnotationMovedInSameParentSerializedDelta,
    AnnotationReplacedSerializedDelta,
    ChildAddedSerializedDelta,
    ChildDeletedSerializedDelta,
    ChildMovedAndReplacedFromOtherContainmentInSameParentSerializedDelta,
    ChildMovedAndReplacedFromOtherContainmentSerializedDelta,
    ChildMovedAndReplacedInSameContainmentSerializedDelta,
    ChildMovedFromOtherContainmentInSameParentSerializedDelta,
    ChildMovedFromOtherContainmentSerializedDelta,
    ChildMovedInSameContainmentSerializedDelta,
    ChildReplacedSerializedDelta,
    CompositeSerializedDelta,
    EntryMovedAndReplacedFromOtherReferenceInSameParentSerializedDelta,
    EntryMovedAndReplacedFromOtherReferenceSerializedDelta,
    EntryMovedAndReplacedInSameReferenceSerializedDelta,
    EntryMovedFromOtherReferenceInSameParentSerializedDelta,
    EntryMovedFromOtherReferenceSerializedDelta,
    EntryMovedInSameReferenceSerializedDelta,
    NoOpSerializedDelta,
    PartitionAddedSerializedDelta,
    PartitionDeletedSerializedDelta,
    PropertyAddedSerializedDelta,
    PropertyChangedSerializedDelta,
    PropertyDeletedSerializedDelta,
    ReferenceAddedSerializedDelta,
    ReferenceChangedSerializedDelta,
    ReferenceDeletedSerializedDelta,
    SerializedDelta
} from "./types.g.js";
import { defaultPropertyValueSerializer } from "./base.js";
import { idFrom } from "../../references.js";
import { serializeNodeBases } from "../../serializer.js";


export const serializeDelta = (delta: IDelta): SerializedDelta => {
    if (delta instanceof PartitionAddedDelta) {
        return {
            kind: "PartitionAdded",
            newPartition: delta.newPartition.id,
            newNodes: serializeNodeBases([delta.newPartition])
        } as PartitionAddedSerializedDelta;
    }

    if (delta instanceof PartitionDeletedDelta) {
        return {
            kind: "PartitionDeleted",
            deletedPartition: delta.deletedPartition.id
        } as PartitionDeletedSerializedDelta;
    }

    if (delta instanceof PropertyAddedDelta) {
        return {
            kind: "PropertyAdded",
            node: delta.node.id,
            property: metaPointerFor(delta.property),
            value: defaultPropertyValueSerializer.serializeValue(delta.value, delta.property)
        } as PropertyAddedSerializedDelta;
    }

    if (delta instanceof PropertyDeletedDelta) {
        return {
            kind: "PropertyDeleted",
            node: delta.node.id,
            property: metaPointerFor(delta.property),
            oldValue: defaultPropertyValueSerializer.serializeValue(delta.oldValue, delta.property)
        } as PropertyDeletedSerializedDelta;
    }

    if (delta instanceof PropertyChangedDelta) {
        return {
            kind: "PropertyChanged",
            node: delta.node.id,
            property: metaPointerFor(delta.property),
            oldValue: defaultPropertyValueSerializer.serializeValue(delta.oldValue, delta.property),
            newValue: defaultPropertyValueSerializer.serializeValue(delta.newValue, delta.property)
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

    if (delta instanceof ChildMovedFromOtherContainmentDelta) {
        return {
            kind: "ChildMovedFromOtherContainment",
            oldParent: delta.oldParent.id,
            oldContainment: metaPointerFor(delta.oldContainment),
            oldIndex: delta.oldIndex,
            newParent: delta.newParent.id,
            newContainment: metaPointerFor(delta.newContainment),
            newIndex: delta.newIndex,
            movedChild: delta.movedChild.id
        } as ChildMovedFromOtherContainmentSerializedDelta;
    }

    if (delta instanceof ChildMovedFromOtherContainmentInSameParentDelta) {
        return {
            kind: "ChildMovedFromOtherContainmentInSameParent",
            parent: delta.parent.id,
            oldContainment: metaPointerFor(delta.oldContainment),
            oldIndex: delta.oldIndex,
            movedChild: delta.movedChild.id,
            newContainment: metaPointerFor(delta.newContainment),
            newIndex: delta.newIndex
        } as ChildMovedFromOtherContainmentInSameParentSerializedDelta;
    }

    if (delta instanceof ChildMovedInSameContainmentDelta) {
        return {
            kind: "ChildMovedInSameContainment",
            parent: delta.parent.id,
            containment: metaPointerFor(delta.containment),
            oldIndex: delta.oldIndex,
            newIndex: delta.newIndex,
            movedChild: delta.movedChild.id
        } as ChildMovedInSameContainmentSerializedDelta;
    }

    if (delta instanceof ChildMovedAndReplacedFromOtherContainmentDelta) {
        return {
            kind: "ChildMovedAndReplacedFromOtherContainment",
            newParent: delta.newParent.id,
            newContainment: metaPointerFor(delta.newContainment),
            newIndex: delta.newIndex,
            movedChild: delta.movedChild.id,
            oldParent: delta.oldParent.id,
            oldContainment: metaPointerFor(delta.oldContainment),
            oldIndex: delta.oldIndex,
            replacedChild: delta.replacedChild.id,
            replacedChildAsNodes: serializeNodeBases([delta.replacedChild])
        } as ChildMovedAndReplacedFromOtherContainmentSerializedDelta;
    }

    if (delta instanceof ChildMovedAndReplacedFromOtherContainmentInSameParentDelta) {
        return {
            kind: "ChildMovedAndReplacedFromOtherContainmentInSameParent",
            parent: delta.parent.id,
            oldContainment: metaPointerFor(delta.oldContainment),
            oldIndex: delta.oldIndex,
            newContainment: metaPointerFor(delta.newContainment),
            newIndex: delta.newIndex,
            movedChild: delta.movedChild.id,
            replacedChild: delta.replacedChild.id,
            replacedChildAsNodes: serializeNodeBases([delta.replacedChild])
        } as ChildMovedAndReplacedFromOtherContainmentInSameParentSerializedDelta;
    }

    if (delta instanceof ChildMovedAndReplacedInSameContainmentDelta) {
        return {
            kind: "ChildMovedAndReplacedInSameContainment",
            parent: delta.parent.id,
            containment: metaPointerFor(delta.containment),
            oldIndex: delta.oldIndex,
            newIndex: delta.newIndex,
            movedChild: delta.movedChild.id,
            replacedChild: delta.replacedChild.id,
            replacedChildAsNodes: serializeNodeBases([delta.replacedChild])
        } as ChildMovedAndReplacedInSameContainmentSerializedDelta;
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

    if (delta instanceof AnnotationMovedAndReplacedFromOtherParentDelta) {
        return {
            kind: "AnnotationMovedAndReplacedFromOtherParent",
            oldParent: delta.oldParent.id,
            oldIndex: delta.oldIndex,
            replacedAnnotation: delta.replacedAnnotation.id,
            replacedAnnotationNodes: serializeNodeBases([delta.replacedAnnotation]),
            newParent: delta.newParent.id,
            newIndex: delta.newIndex,
            movedAnnotation: delta.movedAnnotation.id
        } as AnnotationMovedAndReplacedFromOtherParentSerializedDelta;
    }

    if (delta instanceof AnnotationMovedAndReplacedInSameParentDelta) {
        return {
            kind: "AnnotationMovedAndReplacedInSameParent",
            parent: delta.parent.id,
            oldIndex: delta.oldIndex,
            newIndex: delta.newIndex,
            replacedAnnotation: delta.replacedAnnotation.id,
            replacedAnnotationNodes: serializeNodeBases([delta.replacedAnnotation]),
            movedAnnotation: delta.movedAnnotation.id
        } as AnnotationMovedAndReplacedInSameParentSerializedDelta;
    }

    if (delta instanceof ReferenceAddedDelta) {
        return {
            kind: "ReferenceAdded",
            parent: delta.parent.id,
            reference: metaPointerFor(delta.reference),
            index: delta.index,
            newTarget: idFrom(delta.newTarget)
        } as ReferenceAddedSerializedDelta;
    }

    if (delta instanceof ReferenceDeletedDelta) {
        return {
            kind: "ReferenceDeleted",
            parent: delta.parent.id,
            reference: metaPointerFor(delta.reference),
            index: delta.index,
            deletedTarget: idFrom(delta.deletedTarget)
        } as ReferenceDeletedSerializedDelta;
    }

    if (delta instanceof ReferenceChangedDelta) {
        return {
            kind: "ReferenceChanged",
            parent: delta.parent.id,
            reference: metaPointerFor(delta.reference),
            index: delta.index,
            newTarget: idFrom(delta.newTarget),
            oldTarget: idFrom(delta.oldTarget)
        } as ReferenceChangedSerializedDelta;
    }

    if (delta instanceof EntryMovedFromOtherReferenceDelta) {
        return {
            kind: "EntryMovedFromOtherReference",
            oldParent: delta.oldParent.id,
            oldReference: metaPointerFor(delta.oldReference),
            oldIndex: delta.oldIndex,
            newParent: delta.newParent.id,
            newReference: metaPointerFor(delta.newReference),
            newIndex: delta.newIndex,
            movedTarget: idFrom(delta.movedTarget)
        } as EntryMovedFromOtherReferenceSerializedDelta;
    }

    if (delta instanceof EntryMovedFromOtherReferenceInSameParentDelta) {
        return {
            kind: "EntryMovedFromOtherReferenceInSameParent",
            parent: delta.parent.id,
            oldReference: metaPointerFor(delta.oldReference),
            oldIndex: delta.oldIndex,
            newReference: metaPointerFor(delta.newReference),
            newIndex: delta.newIndex,
            movedTarget: idFrom(delta.movedTarget)
        } as EntryMovedFromOtherReferenceInSameParentSerializedDelta;
    }

    if (delta instanceof EntryMovedInSameReferenceDelta) {
        return {
            kind: "EntryMovedInSameReference",
            parent: delta.parent.id,
            reference: metaPointerFor(delta.reference),
            oldIndex: delta.oldIndex,
            newIndex: delta.newIndex,
            movedTarget: idFrom(delta.movedTarget)
        } as EntryMovedInSameReferenceSerializedDelta;
    }

    if (delta instanceof EntryMovedAndReplacedFromOtherReferenceDelta) {
        return {
            kind: "EntryMovedAndReplacedFromOtherReference",
            newParent: delta.newParent.id,
            newReference: metaPointerFor(delta.newReference),
            newIndex: delta.newIndex,
            movedTarget: idFrom(delta.movedTarget),
            oldParent: delta.oldParent.id,
            oldReference: metaPointerFor(delta.oldReference),
            oldIndex: delta.oldIndex,
            replacedTarget: idFrom(delta.replacedTarget)
        } as EntryMovedAndReplacedFromOtherReferenceSerializedDelta;
    }

    if (delta instanceof EntryMovedAndReplacedFromOtherReferenceInSameParentDelta) {
        return {
            kind: "EntryMovedAndReplacedFromOtherReferenceInSameParent",
            parent: delta.parent.id,
            oldReference: metaPointerFor(delta.oldReference),
            oldIndex: delta.oldIndex,
            newReference: metaPointerFor(delta.newReference),
            newIndex: delta.newIndex,
            movedTarget: idFrom(delta.movedTarget),
            replacedTarget: idFrom(delta.replacedTarget)
        } as EntryMovedAndReplacedFromOtherReferenceInSameParentSerializedDelta;
    }

    if (delta instanceof EntryMovedAndReplacedInSameReferenceDelta) {
        return {
            kind: "EntryMovedAndReplacedInSameReference",
            parent: delta.parent.id,
            reference: metaPointerFor(delta.reference),
            oldIndex: delta.oldIndex,
            newIndex: delta.newIndex,
            movedTarget: idFrom(delta.movedTarget),
            replacedTarget: idFrom(delta.replacedTarget)
        } as EntryMovedAndReplacedInSameReferenceSerializedDelta;
    }

    if (delta instanceof CompositeDelta) {
        return {
            kind: "Composite",
            parts: delta.parts.map(serializeDelta)
        } as CompositeSerializedDelta;
    }

    if (delta instanceof NoOpDelta) {
        return {
            kind: "NoOp"
        } as NoOpSerializedDelta;
    }

    throw new Error(`serialization of delta of class ${delta.constructor.name} not implemented`);
}
