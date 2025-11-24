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

import { LionWebId, LionWebJsonMetaPointer, LionWebJsonChunk } from "@lionweb/json";
import { IdOrUnresolved } from "../../references.js";


export type SerializedDelta =
    | PartitionAddedSerializedDelta
    | PartitionDeletedSerializedDelta
    | PropertyAddedSerializedDelta
    | PropertyDeletedSerializedDelta
    | PropertyChangedSerializedDelta
    | ChildAddedSerializedDelta
    | ChildDeletedSerializedDelta
    | ChildReplacedSerializedDelta
    | ChildMovedFromOtherContainmentSerializedDelta
    | ChildMovedFromOtherContainmentInSameParentSerializedDelta
    | ChildMovedInSameContainmentSerializedDelta
    | ChildMovedAndReplacedFromOtherContainmentSerializedDelta
    | ChildMovedAndReplacedFromOtherContainmentInSameParentSerializedDelta
    | ChildMovedAndReplacedInSameContainmentSerializedDelta
    | AnnotationAddedSerializedDelta
    | AnnotationDeletedSerializedDelta
    | AnnotationReplacedSerializedDelta
    | AnnotationMovedFromOtherParentSerializedDelta
    | AnnotationMovedInSameParentSerializedDelta
    | AnnotationMovedAndReplacedFromOtherParentSerializedDelta
    | AnnotationMovedAndReplacedInSameParentSerializedDelta
    | ReferenceAddedSerializedDelta
    | ReferenceDeletedSerializedDelta
    | ReferenceChangedSerializedDelta
    | EntryMovedFromOtherReferenceSerializedDelta
    | EntryMovedFromOtherReferenceInSameParentSerializedDelta
    | EntryMovedInSameReferenceSerializedDelta
    | EntryMovedAndReplacedFromOtherReferenceSerializedDelta
    | EntryMovedAndReplacedFromOtherReferenceInSameParentSerializedDelta
    | EntryMovedAndReplacedInSameReferenceSerializedDelta
    | CompositeSerializedDelta
    | NoOpSerializedDelta
    ;


export type PartitionAddedSerializedDelta = {
    kind: "PartitionAdded"
    newPartition: LionWebId
    newNodes: LionWebJsonChunk
}

export type PartitionDeletedSerializedDelta = {
    kind: "PartitionDeleted"
    deletedPartition: LionWebId
}

export type PropertyAddedSerializedDelta = {
    kind: "PropertyAdded"
    node: LionWebId
    property: LionWebJsonMetaPointer
    value: string
}

export type PropertyDeletedSerializedDelta = {
    kind: "PropertyDeleted"
    node: LionWebId
    property: LionWebJsonMetaPointer
    oldValue: string
}

export type PropertyChangedSerializedDelta = {
    kind: "PropertyChanged"
    node: LionWebId
    property: LionWebJsonMetaPointer
    oldValue: string
    newValue: string
}

export type ChildAddedSerializedDelta = {
    kind: "ChildAdded"
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    index: number
    newChild: LionWebId
    newNodes: LionWebJsonChunk
}

export type ChildDeletedSerializedDelta = {
    kind: "ChildDeleted"
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    index: number
    deletedChild: LionWebId
    deletedNodes: LionWebJsonChunk
}

export type ChildReplacedSerializedDelta = {
    kind: "ChildReplaced"
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    index: number
    replacedChild: LionWebId
    replacedNodes: LionWebJsonChunk
    newChild: LionWebId
    newNodes: LionWebJsonChunk
}

export type ChildMovedFromOtherContainmentSerializedDelta = {
    kind: "ChildMovedFromOtherContainment"
    oldParent: LionWebId
    oldContainment: LionWebJsonMetaPointer
    oldIndex: number
    newParent: LionWebId
    newContainment: LionWebJsonMetaPointer
    newIndex: number
    movedChild: LionWebId
}

export type ChildMovedFromOtherContainmentInSameParentSerializedDelta = {
    kind: "ChildMovedFromOtherContainmentInSameParent"
    parent: LionWebId
    oldContainment: LionWebJsonMetaPointer
    oldIndex: number
    movedChild: LionWebId
    newContainment: LionWebJsonMetaPointer
    newIndex: number
}

export type ChildMovedInSameContainmentSerializedDelta = {
    kind: "ChildMovedInSameContainment"
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    oldIndex: number
    newIndex: number
    movedChild: LionWebId
}

export type ChildMovedAndReplacedFromOtherContainmentSerializedDelta = {
    kind: "ChildMovedAndReplacedFromOtherContainment"
    newParent: LionWebId
    newContainment: LionWebJsonMetaPointer
    newIndex: number
    movedChild: LionWebId
    oldParent: LionWebId
    oldContainment: LionWebJsonMetaPointer
    oldIndex: number
    replacedChild: LionWebId
    replacedChildAsNodes: LionWebJsonChunk
}

export type ChildMovedAndReplacedFromOtherContainmentInSameParentSerializedDelta = {
    kind: "ChildMovedAndReplacedFromOtherContainmentInSameParent"
    parent: LionWebId
    oldContainment: LionWebJsonMetaPointer
    oldIndex: number
    newContainment: LionWebJsonMetaPointer
    newIndex: number
    movedChild: LionWebId
    replacedChild: LionWebId
    replacedChildAsNodes: LionWebJsonChunk
}

export type ChildMovedAndReplacedInSameContainmentSerializedDelta = {
    kind: "ChildMovedAndReplacedInSameContainment"
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    oldIndex: number
    newIndex: number
    movedChild: LionWebId
    replacedChild: LionWebId
    replacedChildAsNodes: LionWebJsonChunk
}

export type AnnotationAddedSerializedDelta = {
    kind: "AnnotationAdded"
    parent: LionWebId
    index: number
    newAnnotation: LionWebId
    newAnnotationNodes: LionWebJsonChunk
}

export type AnnotationDeletedSerializedDelta = {
    kind: "AnnotationDeleted"
    parent: LionWebId
    index: number
    deletedAnnotation: LionWebId
    deletedAnnotationNodes: LionWebJsonChunk
}

export type AnnotationReplacedSerializedDelta = {
    kind: "AnnotationReplaced"
    parent: LionWebId
    index: number
    replacedAnnotation: LionWebId
    replacedAnnotationNodes: LionWebJsonChunk
    newAnnotation: LionWebId
    newAnnotationNodes: LionWebJsonChunk
}

export type AnnotationMovedFromOtherParentSerializedDelta = {
    kind: "AnnotationMovedFromOtherParent"
    oldParent: LionWebId
    oldIndex: number
    newParent: LionWebId
    newIndex: number
    movedAnnotation: LionWebId
}

export type AnnotationMovedInSameParentSerializedDelta = {
    kind: "AnnotationMovedInSameParent"
    parent: LionWebId
    oldIndex: number
    newIndex: number
    movedAnnotation: LionWebId
}

export type AnnotationMovedAndReplacedFromOtherParentSerializedDelta = {
    kind: "AnnotationMovedAndReplacedFromOtherParent"
    oldParent: LionWebId
    oldIndex: number
    replacedAnnotation: LionWebId
    replacedAnnotationNodes: LionWebJsonChunk
    newParent: LionWebId
    newIndex: number
    movedAnnotation: LionWebId
}

export type AnnotationMovedAndReplacedInSameParentSerializedDelta = {
    kind: "AnnotationMovedAndReplacedInSameParent"
    parent: LionWebId
    oldIndex: number
    newIndex: number
    replacedAnnotation: LionWebId
    replacedAnnotationNodes: LionWebJsonChunk
    movedAnnotation: LionWebId
}

export type ReferenceAddedSerializedDelta = {
    kind: "ReferenceAdded"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    newTarget: IdOrUnresolved
}

export type ReferenceDeletedSerializedDelta = {
    kind: "ReferenceDeleted"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    deletedTarget: IdOrUnresolved
}

export type ReferenceChangedSerializedDelta = {
    kind: "ReferenceChanged"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    newTarget: IdOrUnresolved
    oldTarget: IdOrUnresolved
}

export type EntryMovedFromOtherReferenceSerializedDelta = {
    kind: "EntryMovedFromOtherReference"
    oldParent: LionWebId
    oldReference: LionWebJsonMetaPointer
    oldIndex: number
    newParent: LionWebId
    newReference: LionWebJsonMetaPointer
    newIndex: number
    movedTarget: IdOrUnresolved
}

export type EntryMovedFromOtherReferenceInSameParentSerializedDelta = {
    kind: "EntryMovedFromOtherReferenceInSameParent"
    parent: LionWebId
    oldReference: LionWebJsonMetaPointer
    oldIndex: number
    newReference: LionWebJsonMetaPointer
    newIndex: number
    movedTarget: IdOrUnresolved
}

export type EntryMovedInSameReferenceSerializedDelta = {
    kind: "EntryMovedInSameReference"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    oldIndex: number
    newIndex: number
    movedTarget: IdOrUnresolved
}

export type EntryMovedAndReplacedFromOtherReferenceSerializedDelta = {
    kind: "EntryMovedAndReplacedFromOtherReference"
    newParent: LionWebId
    newReference: LionWebJsonMetaPointer
    newIndex: number
    movedTarget: IdOrUnresolved
    oldParent: LionWebId
    oldReference: LionWebJsonMetaPointer
    oldIndex: number
    replacedTarget: IdOrUnresolved
}

export type EntryMovedAndReplacedFromOtherReferenceInSameParentSerializedDelta = {
    kind: "EntryMovedAndReplacedFromOtherReferenceInSameParent"
    parent: LionWebId
    oldReference: LionWebJsonMetaPointer
    oldIndex: number
    newReference: LionWebJsonMetaPointer
    newIndex: number
    movedTarget: IdOrUnresolved
    replacedTarget: IdOrUnresolved
}

export type EntryMovedAndReplacedInSameReferenceSerializedDelta = {
    kind: "EntryMovedAndReplacedInSameReference"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    oldIndex: number
    newIndex: number
    movedTarget: IdOrUnresolved
    replacedTarget: IdOrUnresolved
}

export type CompositeSerializedDelta = {
    kind: "Composite"
    parts: SerializedDelta[]
}

export type NoOpSerializedDelta = {
    kind: "NoOp"
}

