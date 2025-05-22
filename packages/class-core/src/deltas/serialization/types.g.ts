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

import {IdOrUnresolved} from "@lionweb/core";
import {LionWebId, LionWebJsonMetaPointer, LionWebJsonChunk} from "@lionweb/json";


export type SerializedDelta =
    | NoOpSerializedDelta
    | PropertyAddedSerializedDelta
    | PropertyDeletedSerializedDelta
    | PropertyChangedSerializedDelta
    | ChildAddedSerializedDelta
    | ChildDeletedSerializedDelta
    | ChildReplacedSerializedDelta
    | ChildMovedSerializedDelta
    | ChildMovedInSameContainmentSerializedDelta
    | ReferenceAddedSerializedDelta
    | ReferenceDeletedSerializedDelta
    | ReferenceReplacedSerializedDelta
    | ReferenceMovedSerializedDelta
    | ReferenceMovedInSameReferenceSerializedDelta
    | AnnotationAddedSerializedDelta
    | AnnotationDeletedSerializedDelta
    | AnnotationReplacedSerializedDelta
    | AnnotationMovedFromOtherParentSerializedDelta
    | AnnotationMovedInSameParentSerializedDelta
    ;


export type NoOpSerializedDelta = {
    kind: "NoOp"
}

export type PropertyAddedSerializedDelta = {
    kind: "PropertyAdded"
    container: LionWebId
    property: LionWebJsonMetaPointer
    value: string
}

export type PropertyDeletedSerializedDelta = {
    kind: "PropertyDeleted"
    container: LionWebId
    property: LionWebJsonMetaPointer
    oldValue: string
}

export type PropertyChangedSerializedDelta = {
    kind: "PropertyChanged"
    container: LionWebId
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

export type ChildMovedSerializedDelta = {
    kind: "ChildMoved"
    oldParent: LionWebId
    oldContainment: LionWebJsonMetaPointer
    oldIndex: number
    newParent: LionWebId
    newContainment: LionWebJsonMetaPointer
    newIndex: number
    child: LionWebId
}

export type ChildMovedInSameContainmentSerializedDelta = {
    kind: "ChildMovedInSameContainment"
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    oldIndex: number
    newIndex: number
    child: LionWebId
}

export type ReferenceAddedSerializedDelta = {
    kind: "ReferenceAdded"
    container: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    newTarget: IdOrUnresolved
}

export type ReferenceDeletedSerializedDelta = {
    kind: "ReferenceDeleted"
    container: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    deletedTarget: IdOrUnresolved
}

export type ReferenceReplacedSerializedDelta = {
    kind: "ReferenceReplaced"
    container: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    replacedTarget: IdOrUnresolved
    newTarget: IdOrUnresolved
}

export type ReferenceMovedSerializedDelta = {
    kind: "ReferenceMoved"
    oldContainer: LionWebId
    oldReference: LionWebJsonMetaPointer
    oldIndex: number
    newContainer: LionWebId
    newReference: LionWebJsonMetaPointer
    newIndex: number
    target: IdOrUnresolved
}

export type ReferenceMovedInSameReferenceSerializedDelta = {
    kind: "ReferenceMovedInSameReference"
    container: LionWebId
    reference: LionWebJsonMetaPointer
    oldIndex: number
    newIndex: number
    target: IdOrUnresolved
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

