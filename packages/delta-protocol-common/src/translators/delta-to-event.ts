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
    EntryMovedAndReplacedFromOtherReferenceDelta,
    EntryMovedAndReplacedFromOtherReferenceInSameParentDelta,
    EntryMovedAndReplacedInSameReferenceDelta,
    EntryMovedFromOtherReferenceDelta,
    EntryMovedFromOtherReferenceInSameParentDelta,
    EntryMovedInSameReferenceDelta,
    IDelta,
    NoOpDelta,
    PartitionAddedDelta,
    PartitionDeletedDelta,
    PropertyAddedDelta,
    PropertyChangedDelta,
    PropertyDeletedDelta,
    ReferenceAddedDelta,
    ReferenceChangedDelta,
    ReferenceDeletedDelta,
    serializeNodeBases
} from "@lionweb/class-core"
import { metaPointerFor, serializedRef } from "@lionweb/core"
import {
    AnnotationAddedEvent,
    AnnotationDeletedEvent,
    AnnotationMovedAndReplacedFromOtherParentEvent,
    AnnotationMovedAndReplacedInSameParentEvent,
    AnnotationMovedFromOtherParentEvent,
    AnnotationMovedInSameParentEvent,
    AnnotationReplacedEvent,
    ChildAddedEvent,
    ChildDeletedEvent,
    ChildMovedAndReplacedFromOtherContainmentEvent,
    ChildMovedAndReplacedFromOtherContainmentInSameParentEvent,
    ChildMovedAndReplacedInSameContainmentEvent,
    ChildMovedFromOtherContainmentEvent,
    ChildMovedFromOtherContainmentInSameParentEvent,
    ChildMovedInSameContainmentEvent,
    ChildReplacedEvent,
    CompositeEvent,
    EntryMovedAndReplacedFromOtherReferenceEvent,
    EntryMovedAndReplacedFromOtherReferenceInSameParentEvent,
    EntryMovedAndReplacedInSameReferenceEvent,
    EntryMovedFromOtherReferenceEvent,
    EntryMovedFromOtherReferenceInSameParentEvent,
    EntryMovedInSameReferenceEvent,
    Event,
    NoOpEvent,
    PartitionAddedEvent,
    PartitionDeletedEvent,
    PropertyAddedEvent,
    PropertyChangedEvent,
    PropertyDeletedEvent,
    ReferenceAddedEvent,
    ReferenceChangedEvent,
    ReferenceDeletedEvent
} from "../payload/index.js"


export const deltaAsEvent = (delta: IDelta, lastUsedSequenceNumber: number): [event: Event, lastUsedSequenceNumber: number] => {

    let sequenceNumber = lastUsedSequenceNumber
    const completed = <ET extends Event>(
        technicalName: ET["messageKind"],
        partialEvent: Omit<ET, "messageKind" | "sequenceNumber" | "originCommands" | "protocolMessages">
    ) => ({
        messageKind: technicalName,
        ...partialEvent,
        sequenceNumber: ++sequenceNumber,
        originCommands: [],
        protocolMessages: []
    })

    const translated = (delta: IDelta): Event => {
        if (delta instanceof PartitionAddedDelta) {
            return completed<PartitionAddedEvent>("PartitionAdded", { // § 6.6.1.1
                newPartition: serializeNodeBases([delta.newPartition])
            })
        }
        if (delta instanceof PartitionDeletedDelta) {
            return completed<PartitionDeletedEvent>("PartitionDeleted", { // § 6.6.1.2
                deletedPartition: delta.deletedPartition.id
            })
        }
        if (delta instanceof PropertyAddedDelta) {
            return completed<PropertyAddedEvent<unknown>>("PropertyAdded", { // § 6.6.3.1
                node: delta.node.id,
                property: metaPointerFor(delta.property),
                newValue: delta.value
            })
        }
        if (delta instanceof PropertyDeletedDelta) {
            return completed<PropertyDeletedEvent<unknown>>("PropertyDeleted", { // § 6.6.3.2
                node: delta.node.id,
                property: metaPointerFor(delta.property),
                oldValue: delta.oldValue
            })
        }
        if (delta instanceof PropertyChangedDelta) {
            return completed<PropertyChangedEvent<unknown>>("PropertyChanged", { // § 6.6.3.3
                node: delta.node.id,
                property: metaPointerFor(delta.property),
                newValue: delta.newValue,
                oldValue: delta.oldValue
            })
        }
        if (delta instanceof ChildAddedDelta) {
            return completed<ChildAddedEvent>("ChildAdded", { // § 6.6.4.1
                parent: delta.parent.id,
                newChild: serializeNodeBases([delta.newChild]),
                containment: metaPointerFor(delta.containment),
                index: delta.index
            })
        }
        if (delta instanceof ChildDeletedDelta) {
            return completed<ChildDeletedEvent>("ChildDeleted", { // § 6.6.4.2
                parent: delta.parent.id,
                containment: metaPointerFor(delta.containment),
                index: delta.index,
                deletedChild: delta.deletedChild.id,
                deletedDescendants: []  // FIXME  implement
            })
        }
        if (delta instanceof ChildReplacedDelta) {
            return completed<ChildReplacedEvent>("ChildReplaced", { // § 6.6.4.3
                newChild: serializeNodeBases([delta.newChild]),
                parent: delta.parent.id,
                containment: metaPointerFor(delta.containment),
                index: delta.index,
                replacedChild: delta.replacedChild.id,
                replacedDescendants: []  // FIXME  implement
            })
        }
        if (delta instanceof ChildMovedFromOtherContainmentDelta) {
            return completed<ChildMovedFromOtherContainmentEvent>("ChildMovedFromOtherContainment", { // § 6.6.4.4
                newParent: delta.newParent.id,
                newContainment: metaPointerFor(delta.newContainment),
                newIndex: delta.newIndex,
                movedChild: delta.movedChild.id,
                oldParent: delta.oldParent.id,
                oldContainment: metaPointerFor(delta.oldContainment),
                oldIndex: delta.oldIndex
            })
        }
        if (delta instanceof ChildMovedFromOtherContainmentInSameParentDelta) {
            return completed<ChildMovedFromOtherContainmentInSameParentEvent>("ChildMovedFromOtherContainmentInSameParent", { // § 6.6.4.5
                newContainment: metaPointerFor(delta.newContainment),
                newIndex: delta.newIndex,
                movedChild: delta.movedChild.id,
                parent: delta.parent.id,
                oldContainment: metaPointerFor(delta.oldContainment),
                oldIndex: delta.oldIndex
            })
        }
        if (delta instanceof ChildMovedInSameContainmentDelta) {
            return completed<ChildMovedInSameContainmentEvent>("ChildMovedInSameContainment", { // § 6.6.4.6
                parent: delta.parent.id,
                containment: metaPointerFor(delta.containment),
                oldIndex: delta.oldIndex,
                newIndex: delta.newIndex,
                movedChild: delta.movedChild.id
            })
        }
        if (delta instanceof ChildMovedAndReplacedFromOtherContainmentDelta) {
            return completed<ChildMovedAndReplacedFromOtherContainmentEvent>("ChildMovedAndReplacedFromOtherContainment", { // § 6.6.4.7
                newParent: delta.newParent.id,
                newContainment: metaPointerFor(delta.newContainment),
                newIndex: delta.newIndex,
                oldParent: delta.oldParent.id,
                oldContainment: metaPointerFor(delta.oldContainment),
                oldIndex: delta.oldIndex,
                movedChild: delta.movedChild.id,
                replacedChild: delta.replacedChild.id,
                replacedDescendants: []  // FIXME  implement
            })
        }
        if (delta instanceof ChildMovedAndReplacedFromOtherContainmentInSameParentDelta) {
            return completed<ChildMovedAndReplacedFromOtherContainmentInSameParentEvent>("ChildMovedAndReplacedFromOtherContainmentInSameParent", { // § 6.6.4.8
                parent: delta.parent.id,
                oldContainment: metaPointerFor(delta.oldContainment),
                oldIndex: delta.oldIndex,
                newContainment: metaPointerFor(delta.newContainment),
                newIndex: delta.newIndex,
                replacedChild: delta.replacedChild.id,
                replacedDescendants: [],  // FIXME  implement
                movedChild: delta.movedChild.id
            })
        }
        if (delta instanceof ChildMovedAndReplacedInSameContainmentDelta) {
            return completed<ChildMovedAndReplacedInSameContainmentEvent>("ChildMovedAndReplacedInSameContainment", { // § 6.6.4.9
                parent: delta.parent.id,
                containment: metaPointerFor(delta.containment),
                oldIndex: delta.oldIndex,
                newIndex: delta.newIndex,
                movedChild: delta.movedChild.id,
                replacedChild: delta.replacedChild.id,
                replacedDescendants: []  // FIXME  implement
            })
        }
        if (delta instanceof AnnotationAddedDelta) {
            return completed<AnnotationAddedEvent>("AnnotationAdded", { // § 6.6.5.1
                parent: delta.parent.id,
                index: delta.index,
                newAnnotation: serializeNodeBases([delta.newAnnotation])
            })
        }
        if (delta instanceof AnnotationDeletedDelta) {
            return completed<AnnotationDeletedEvent>("AnnotationDeleted", { // § 6.6.5.2
                parent: delta.parent.id,
                deletedAnnotation: delta.deletedAnnotation.id,
                index: delta.index,
                deletedDescendants: []  // FIXME  implement
            })
        }
        if (delta instanceof AnnotationReplacedDelta) {
            return completed<AnnotationReplacedEvent>("AnnotationReplaced", { // § 6.6.5.3
                newAnnotation: serializeNodeBases([delta.newAnnotation]),
                parent: delta.parent.id,
                index: delta.index,
                replacedAnnotation: delta.replacedAnnotation.id,
                replacedDescendants: []  // FIXME  implement
            })
        }
        if (delta instanceof AnnotationMovedFromOtherParentDelta) {
            return completed<AnnotationMovedFromOtherParentEvent>("AnnotationMovedFromOtherParent", { // § 6.6.5.4
                oldParent: delta.oldParent.id,
                oldIndex: delta.oldIndex,
                newParent: delta.newParent.id,
                newIndex: delta.newIndex,
                movedAnnotation: delta.movedAnnotation.id
            })
        }
        if (delta instanceof AnnotationMovedInSameParentDelta) {
            return completed<AnnotationMovedInSameParentEvent>("AnnotationMovedInSameParent", { // § 6.6.5.5
                parent: delta.parent.id,
                oldIndex: delta.oldIndex,
                newIndex: delta.newIndex,
                movedAnnotation: delta.movedAnnotation.id
            })
        }
        if (delta instanceof AnnotationMovedAndReplacedFromOtherParentDelta) {
            return completed<AnnotationMovedAndReplacedFromOtherParentEvent>("AnnotationMovedAndReplacedFromOtherParent", { // § 6.6.5.6
                oldParent: delta.oldParent.id,
                oldIndex: delta.oldIndex,
                newParent: delta.newParent.id,
                newIndex: delta.newIndex,
                replacedAnnotation: delta.replacedAnnotation.id,
                replacedDescendants: [],    // FIXME  implement
                movedAnnotation: delta.movedAnnotation.id
            })
        }
        if (delta instanceof AnnotationMovedAndReplacedInSameParentDelta) {
            return completed<AnnotationMovedAndReplacedInSameParentEvent>("AnnotationMovedAndReplacedInSameParent", { // § 6.6.5.7
                parent: delta.parent.id,
                oldIndex: delta.oldIndex,
                newIndex: delta.newIndex,
                replacedAnnotation: delta.replacedAnnotation.id,
                replacedDescendants: [],    // FIXME  implement
                movedAnnotation: delta.movedAnnotation.id
            })
        }
        if (delta instanceof ReferenceAddedDelta) {
            return completed<ReferenceAddedEvent>("ReferenceAdded", { // § 6.6.6.1
                parent: delta.parent.id,
                reference: metaPointerFor(delta.reference),
                index: delta.index,
                newTarget: serializedRef(delta.newTarget),
                newResolveInfo: null
            })
        }
        if (delta instanceof ReferenceDeletedDelta) {
            return completed<ReferenceDeletedEvent>("ReferenceDeleted", { // § 6.6.6.2
                parent: delta.parent.id,
                reference: metaPointerFor(delta.reference),
                index: delta.index,
                deletedTarget: serializedRef(delta.deletedTarget),
                deletedResolveInfo: null
            })
        }
        if (delta instanceof ReferenceChangedDelta) {
            return completed<ReferenceChangedEvent>("ReferenceChanged", { // § 6.6.6.3
                parent: delta.parent.id,
                reference: metaPointerFor(delta.reference),
                index: delta.index,
                oldTarget: serializedRef(delta.oldTarget),
                oldResolveInfo: null,
                newTarget: serializedRef(delta.newTarget),
                newResolveInfo: null
            })
        }
        if (delta instanceof EntryMovedFromOtherReferenceDelta) {
            return completed<EntryMovedFromOtherReferenceEvent>("EntryMovedFromOtherReference", { // § 6.6.6.4
                newParent: delta.newParent.id,
                newReference: metaPointerFor(delta.newReference),
                newIndex: delta.newIndex,
                oldParent: delta.oldParent.id,
                oldReference: metaPointerFor(delta.oldReference),
                oldIndex: delta.oldIndex,
                movedTarget: serializedRef(delta.movedTarget),
                movedResolveInfo: null
            })
        }
        if (delta instanceof EntryMovedFromOtherReferenceInSameParentDelta) {
            return completed<EntryMovedFromOtherReferenceInSameParentEvent>("EntryMovedFromOtherReferenceInSameParent", { // § 6.6.6.5
                parent: delta.parent.id,
                newReference: metaPointerFor(delta.newReference),
                newIndex: delta.newIndex,
                oldReference: metaPointerFor(delta.oldReference),
                oldIndex: delta.oldIndex,
                movedTarget: serializedRef(delta.movedTarget),
                movedResolveInfo: null
            })
        }
        if (delta instanceof EntryMovedInSameReferenceDelta) {
            return completed<EntryMovedInSameReferenceEvent>("EntryMovedInSameReference", { // § 6.6.6.6
                parent: delta.parent.id,
                reference: metaPointerFor(delta.reference),
                oldIndex: delta.oldIndex,
                newIndex: delta.newIndex,
                movedTarget: serializedRef(delta.movedTarget),
                movedResolveInfo: null
            })
        }
        if (delta instanceof EntryMovedAndReplacedFromOtherReferenceDelta) {
            return completed<EntryMovedAndReplacedFromOtherReferenceEvent>("EntryMovedAndReplacedFromOtherReference", { // § 6.6.6.7
                newParent: delta.newParent.id,
                newReference: metaPointerFor(delta.newReference),
                newIndex: delta.newIndex,
                replacedTarget: serializedRef(delta.replacedTarget),
                replacedResolveInfo: null,
                oldParent: delta.oldParent.id,
                oldReference: metaPointerFor(delta.oldReference),
                oldIndex: delta.oldIndex,
                movedTarget: serializedRef(delta.movedTarget),
                movedResolveInfo: null
            })
        }
        if (delta instanceof EntryMovedAndReplacedFromOtherReferenceInSameParentDelta) {
            return completed<EntryMovedAndReplacedFromOtherReferenceInSameParentEvent>("EntryMovedAndReplacedFromOtherReferenceInSameParent", { // § 6.6.6.8
                parent: delta.parent.id,
                newReference: metaPointerFor(delta.newReference),
                newIndex: delta.newIndex,
                replacedTarget: serializedRef(delta.replacedTarget),
                replacedResolveInfo: null,
                oldReference: metaPointerFor(delta.oldReference),
                oldIndex: delta.oldIndex,
                movedTarget: serializedRef(delta.movedTarget),
                movedResolveInfo: null
            })
        }
        if (delta instanceof EntryMovedAndReplacedInSameReferenceDelta) {
            return completed<EntryMovedAndReplacedInSameReferenceEvent>("EntryMovedAndReplacedInSameReference", { // § 6.6.6.9
                parent: delta.parent.id,
                reference: metaPointerFor(delta.reference),
                oldIndex: delta.oldIndex,
                movedTarget: serializedRef(delta.movedTarget),
                movedResolveInfo: null,
                newIndex: delta.newIndex,
                replacedTarget: serializedRef(delta.replacedTarget),
                replacedResolveInfo: null
            })
        }
        if (delta instanceof CompositeDelta) {
            return completed<CompositeEvent>("CompositeEvent", { // § 6.6.7.1
                parts: delta.parts
                    .map((part) => translated(part))
                    .filter((event) => event !== undefined) as Event[]
            })
        }
        if (delta instanceof NoOpDelta) {
            return completed<NoOpEvent>("NoOp", {})
        }

        throw new Error(`can't handle delta of type ${delta.constructor.name}`)
    }

    return [translated(delta), sequenceNumber]
}

