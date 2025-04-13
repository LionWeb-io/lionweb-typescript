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

import {Id, IdOrUnresolved} from "@lionweb/core";
import {LionWebJsonMetaPointer, LionWebJsonChunk} from "@lionweb/json";


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
    container: Id
    property: LionWebJsonMetaPointer
    value: string
}

export type PropertyDeletedSerializedDelta = {
    kind: "PropertyDeleted"
    container: Id
    property: LionWebJsonMetaPointer
    oldValue: string
}

export type PropertyChangedSerializedDelta = {
    kind: "PropertyChanged"
    container: Id
    property: LionWebJsonMetaPointer
    oldValue: string
    newValue: string
}

export type ChildAddedSerializedDelta = {
    kind: "ChildAdded"
    parent: Id
    containment: LionWebJsonMetaPointer
    index: number
    newChild: Id
    newNodes: LionWebJsonChunk
}

export type ChildDeletedSerializedDelta = {
    kind: "ChildDeleted"
    parent: Id
    containment: LionWebJsonMetaPointer
    index: number
    deletedChild: Id
    deletedNodes: LionWebJsonChunk
}

export type ChildReplacedSerializedDelta = {
    kind: "ChildReplaced"
    parent: Id
    containment: LionWebJsonMetaPointer
    index: number
    replacedChild: Id
    replacedNodes: LionWebJsonChunk
    newChild: Id
    newNodes: LionWebJsonChunk
}

export type ChildMovedSerializedDelta = {
    kind: "ChildMoved"
    oldParent: Id
    oldContainment: LionWebJsonMetaPointer
    oldIndex: number
    newParent: Id
    newContainment: LionWebJsonMetaPointer
    newIndex: number
    child: Id
}

export type ChildMovedInSameContainmentSerializedDelta = {
    kind: "ChildMovedInSameContainment"
    parent: Id
    containment: LionWebJsonMetaPointer
    oldIndex: number
    newIndex: number
    child: Id
}

export type ReferenceAddedSerializedDelta = {
    kind: "ReferenceAdded"
    container: Id
    reference: LionWebJsonMetaPointer
    index: number
    newTarget: IdOrUnresolved
}

export type ReferenceDeletedSerializedDelta = {
    kind: "ReferenceDeleted"
    container: Id
    reference: LionWebJsonMetaPointer
    index: number
    deletedTarget: IdOrUnresolved
}

export type ReferenceReplacedSerializedDelta = {
    kind: "ReferenceReplaced"
    container: Id
    reference: LionWebJsonMetaPointer
    index: number
    replacedTarget: IdOrUnresolved
    newTarget: IdOrUnresolved
}

export type ReferenceMovedSerializedDelta = {
    kind: "ReferenceMoved"
    oldContainer: Id
    oldReference: LionWebJsonMetaPointer
    oldIndex: number
    newContainer: Id
    newReference: LionWebJsonMetaPointer
    newIndex: number
    target: IdOrUnresolved
}

export type ReferenceMovedInSameReferenceSerializedDelta = {
    kind: "ReferenceMovedInSameReference"
    container: Id
    reference: LionWebJsonMetaPointer
    oldIndex: number
    newIndex: number
    target: IdOrUnresolved
}

export type AnnotationAddedSerializedDelta = {
    kind: "AnnotationAdded"
    parent: Id
    index: number
    newAnnotation: Id
    newAnnotationNodes: LionWebJsonChunk
}

export type AnnotationDeletedSerializedDelta = {
    kind: "AnnotationDeleted"
    parent: Id
    index: number
    deletedAnnotation: Id
    deletedAnnotationNodes: LionWebJsonChunk
}

export type AnnotationReplacedSerializedDelta = {
    kind: "AnnotationReplaced"
    parent: Id
    index: number
    replacedAnnotation: Id
    replacedAnnotationNodes: LionWebJsonChunk
    newAnnotation: Id
    newAnnotationNodes: LionWebJsonChunk
}

export type AnnotationMovedFromOtherParentSerializedDelta = {
    kind: "AnnotationMovedFromOtherParent"
    oldParent: Id
    oldIndex: number
    newParent: Id
    newIndex: number
    movedAnnotation: Id
}

export type AnnotationMovedInSameParentSerializedDelta = {
    kind: "AnnotationMovedInSameParent"
    parent: Id
    oldIndex: number
    newIndex: number
    movedAnnotation: Id
}

