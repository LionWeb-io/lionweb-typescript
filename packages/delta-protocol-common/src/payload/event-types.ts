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

import { LionWebId, LionWebJsonChunk, LionWebJsonMetaPointer } from "@lionweb/json"
import { mapFrom } from "@lionweb/ts-utils"
import { DeltaProtocolMessage, Message } from "./common.js"

export type CommandOrigin = {
    participationId: LionWebId
    commandId: LionWebId
}

export interface Event extends DeltaProtocolMessage {
    originCommands: CommandOrigin[]
    sequenceNumber: number
}


// in order of the specification (§ 6.6):

/** § 6.6.1.1 */
export interface PartitionAddedEvent extends Event {
    messageKind: "PartitionAdded"
    newPartition: LionWebJsonChunk
}

/** § 6.6.1.2 */
export interface PartitionDeletedEvent extends Event {
    messageKind: "PartitionDeleted"
    deletedPartition: LionWebId
}

/** § 6.6.2.1 */
export interface ClassifierChangedEvent extends Event {
    messageKind: "ClassifierChanged"
    node: LionWebId
    newClassifier: LionWebJsonMetaPointer
    oldClassifier: LionWebJsonMetaPointer
}

/** § 6.6.3.1 */
export interface PropertyAddedEvent<T> extends Event {
    messageKind: "PropertyAdded"
    node: LionWebId
    property: LionWebJsonMetaPointer
    newValue: T
}

/** § 6.6.3.2 */
export interface PropertyDeletedEvent<T> extends Event {
    messageKind: "PropertyDeleted"
    node: LionWebId
    property: LionWebJsonMetaPointer
    oldValue: T
}

/** § 6.6.3.3 */
export interface PropertyChangedEvent<T> extends Event {
    messageKind: "PropertyChanged"
    node: LionWebId
    property: LionWebJsonMetaPointer
    oldValue: T
    newValue: T
}

/** § 6.6.4.1 */
export interface ChildAddedEvent extends Event {
    messageKind: "ChildAdded"
    parent: LionWebId
    newChild: LionWebJsonChunk
    containment: LionWebJsonMetaPointer
    index: number
}

/** § 6.6.4.2 */
export interface ChildDeletedEvent extends Event {
    messageKind: "ChildDeleted"
    deletedChild: LionWebId
    deletedDescendants: LionWebId[]
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    index: number
}

/** § 6.6.4.3 */
export interface ChildReplacedEvent extends Event {
    messageKind: "ChildReplaced"
    newChild: LionWebJsonChunk
    replacedChild: LionWebId
    replacedDescendants: LionWebId[]
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    index: number
}

/** § 6.6.4.4 */
export interface ChildMovedFromOtherContainmentEvent extends Event {
    messageKind: "ChildMovedFromOtherContainment"
    newParent: LionWebId
    newContainment: LionWebJsonMetaPointer
    newIndex: number
    movedChild: LionWebId
    oldParent: LionWebId
    oldContainment: LionWebJsonMetaPointer
    oldIndex: number
}

/** § 6.6.4.5 */
export interface ChildMovedFromOtherContainmentInSameParentEvent extends Event {
    messageKind: "ChildMovedFromOtherContainmentInSameParent"
    newContainment: LionWebJsonMetaPointer
    newIndex: number
    movedChild: LionWebId
    parent: LionWebId
    oldContainment: LionWebJsonMetaPointer
    oldIndex: number
}

/** § 6.6.4.6 */
export interface ChildMovedInSameContainmentEvent extends Event {
    messageKind: "ChildMovedInSameContainment"
    newIndex: number
    movedChild: LionWebId
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    oldIndex: number
}

/** § 6.6.4.7 */
export interface ChildMovedAndReplacedFromOtherContainmentEvent extends Event {
    messageKind: "ChildMovedAndReplacedFromOtherContainment"
    newParent: LionWebId
    newContainment: LionWebJsonMetaPointer
    newIndex: number
    movedChild: LionWebId
    oldParent: LionWebId
    oldContainment: LionWebJsonMetaPointer
    oldIndex: number
    replacedChild: LionWebId
    replacedDescendants: LionWebId[]
}

/** § 6.6.4.8 */
export interface ChildMovedAndReplacedFromOtherContainmentInSameParentEvent extends Event {
    messageKind: "ChildMovedAndReplacedFromOtherContainmentInSameParent"
    newContainment: LionWebJsonMetaPointer
    newIndex: number
    movedChild: LionWebId
    parent: LionWebId
    oldContainment: LionWebJsonMetaPointer
    oldIndex: number
    replacedChild: LionWebId
    replacedDescendants: LionWebId[]
}

/** § 6.6.4.9 */
export interface ChildMovedAndReplacedInSameContainmentEvent extends Event {
    messageKind: "ChildMovedAndReplacedInSameContainment"
    newIndex: number
    movedChild: LionWebId
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    oldIndex: number
    replacedChild: LionWebId
    replacedDescendants: LionWebId[]
}

/** § 6.6.5.1 */
export interface AnnotationAddedEvent extends Event {
    messageKind: "AnnotationAdded"
    parent: LionWebId
    newAnnotation: LionWebJsonChunk
    index: number
}

/** § 6.6.5.2 */
export interface AnnotationDeletedEvent extends Event {
    messageKind: "AnnotationDeleted"
    deletedAnnotation: LionWebId
    deletedDescendants: LionWebId[]
    parent: LionWebId
    index: number
}

/** § 6.6.5.3 */
export interface AnnotationReplacedEvent extends Event {
    messageKind: "AnnotationReplaced"
    newAnnotation: LionWebJsonChunk
    replacedAnnotation: LionWebId
    replacedDescendants: LionWebId[]
    parent: LionWebId
    index: number
}

/** § 6.6.5.4 */
export interface AnnotationMovedFromOtherParentEvent extends Event {
    messageKind: "AnnotationMovedFromOtherParent"
    newParent: LionWebId
    newIndex: number
    movedAnnotation: LionWebId
    oldParent: LionWebId
    oldIndex: number
}

/** § 6.6.5.5 */
export interface AnnotationMovedInSameParentEvent extends Event {
    messageKind: "AnnotationMovedInSameParent"
    newIndex: number
    movedAnnotation: LionWebId
    parent: LionWebId
    oldIndex: number
}

/** § 6.6.5.6 */
export interface AnnotationMovedAndReplacedFromOtherParentEvent extends Event {
    messageKind: "AnnotationMovedAndReplacedFromOtherParent"
    newParent: LionWebId
    newIndex: number
    movedAnnotation: LionWebId
    oldParent: LionWebId
    oldIndex: number
    replacedAnnotation: LionWebId
    replacedDescendants: LionWebId[]
}

/** § 6.6.5.7 */
export interface AnnotationMovedAndReplacedInSameParentEvent extends Event {
    messageKind: "AnnotationMovedAndReplacedInSameParent"
    newIndex: number
    movedAnnotation: LionWebId
    parent: LionWebId
    oldIndex: number
    replacedAnnotation: LionWebId
    replacedDescendants: LionWebId[]
}

/** § 6.6.6.1 */
export interface ReferenceAddedEvent extends Event {
    messageKind: "ReferenceAdded"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    newTarget: LionWebId | null
    newResolveInfo: string | null
}

/** § 6.6.6.2 */
export interface ReferenceDeletedEvent extends Event {
    messageKind: "ReferenceDeleted"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    deletedTarget: LionWebId | null
    deletedResolveInfo: string | null
}

/** § 6.6.6.3 */
export interface ReferenceChangedEvent extends Event {
    messageKind: "ReferenceChanged"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    newTarget: LionWebId | null
    newResolveInfo: string | null
    oldTarget: LionWebId | null
    oldResolveInfo: string | null
}

/** § 6.6.6.4 */
export interface EntryMovedFromOtherReferenceEvent extends Event {
    messageKind: "EntryMovedFromOtherReference"
    newParent: LionWebId
    newReference: LionWebJsonMetaPointer
    newIndex: number
    oldParent: LionWebId
    oldReference: LionWebJsonMetaPointer
    oldIndex: number
    movedTarget: LionWebId | null
    movedResolveInfo: string | null
}

/** § 6.6.6.5 */
export interface EntryMovedFromOtherReferenceInSameParentEvent extends Event {
    messageKind: "EntryMovedFromOtherReferenceInSameParent"
    parent: LionWebId
    newReference: LionWebJsonMetaPointer
    newIndex: number
    oldReference: LionWebJsonMetaPointer
    oldIndex: number
    movedTarget: LionWebId | null
    movedResolveInfo: string | null
}

/** § 6.6.6.6 */
export interface EntryMovedInSameReferenceEvent extends Event {
    messageKind: "EntryMovedInSameReference"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    oldIndex: number
    newIndex: number
    movedTarget: LionWebId | null
    movedResolveInfo: string | null
}

/** § 6.6.6.7 */
export interface EntryMovedAndReplacedFromOtherReferenceEvent extends Event {
    messageKind: "EntryMovedAndReplacedFromOtherReference"
    newParent: LionWebId
    newReference: LionWebJsonMetaPointer
    newIndex: number
    movedTarget: LionWebId | null
    movedResolveInfo: string | null
    oldParent: LionWebId
    oldReference: LionWebJsonMetaPointer
    oldIndex: number
    replacedTarget: LionWebId | null
    replacedResolveInfo: string | null
}

/** § 6.6.6.8 */
export interface EntryMovedAndReplacedFromOtherReferenceInSameParentEvent extends Event {
    messageKind: "EntryMovedAndReplacedFromOtherReferenceInSameParent"
    parent: LionWebId
    newReference: LionWebJsonMetaPointer
    newIndex: number
    movedTarget: LionWebId | null
    movedResolveInfo: string | null
    oldReference: LionWebJsonMetaPointer
    oldIndex: number
    replacedTarget: LionWebId | null
    replacedResolveInfo: string | null
}

/** § 6.6.6.9 */
export interface EntryMovedAndReplacedInSameReferenceEvent extends Event {
    messageKind: "EntryMovedAndReplacedInSameReference"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    newIndex: number
    movedTarget: LionWebId | null
    movedResolveInfo: string | null
    oldIndex: number
    replacedTarget: LionWebId | null
    replacedResolveInfo: string | null
}

/** § 6.6.6.10 */
export interface ReferenceResolveInfoAddedEvent extends Event {
    messageKind: "ReferenceResolveInfoAdded"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    newResolveInfo: string
    target: LionWebId
}

/** § 6.6.6.11 */
export interface ReferenceResolveInfoDeletedEvent extends Event {
    messageKind: "ReferenceResolveInfoDeleted"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    deletedResolveInfo: string
    target: LionWebId
}

/** § 6.6.6.12 */
export interface ReferenceResolveInfoChangedEvent extends Event {
    messageKind: "ReferenceResolveInfoChanged"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    newResolveInfo: string
    target: LionWebId | null
    oldResolveInfo: string
}

/** § 6.6.6.13 */
export interface ReferenceTargetAddedEvent extends Event {
    messageKind: "ReferenceTargetAdded"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    newTarget: LionWebId | null
    resolveInfo: string
}

/** § 6.6.6.14 */
export interface ReferenceTargetDeletedEvent extends Event {
    messageKind: "ReferenceTargetDeleted"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    resolveInfo: string | null
    deletedTarget: LionWebId
}

/** § 6.6.6.15 */
export interface ReferenceTargetChangedEvent extends Event {
    messageKind: "ReferenceTargetChanged"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    newTarget: LionWebId
    resolveInfo: string | null
    replacedTarget: LionWebId
}

/** § 6.6.7.1 */
export interface CompositeEvent extends Event {
    messageKind: "CompositeEvent"
    parts: Event[]
}

/** § 6.6.7.2 */
export interface NoOpEvent extends Event {
    messageKind: "NoOp"
}

/** § 6.6.7.3 */
export interface ErrorEvent extends Event {
    messageKind: "Error"
    errorCode: string
    message: string
}


/*
 * **DEV note**: run
 *
 *  $ node src/code-reading/event-message-kinds.js
 *
 * inside the build package to generate the contents of the following array.
 */

const eventMessageKinds = mapFrom(
    [
        "PartitionAdded",
        "PartitionDeleted",
        "ClassifierChanged",
        "PropertyAdded",
        "PropertyDeleted",
        "PropertyChanged",
        "ChildAdded",
        "ChildDeleted",
        "ChildReplaced",
        "ChildMovedFromOtherContainment",
        "ChildMovedFromOtherContainmentInSameParent",
        "ChildMovedInSameContainment",
        "ChildMovedAndReplacedFromOtherContainment",
        "ChildMovedAndReplacedFromOtherContainmentInSameParent",
        "ChildMovedAndReplacedInSameContainment",
        "AnnotationAdded",
        "AnnotationDeleted",
        "AnnotationReplaced",
        "AnnotationMovedFromOtherParent",
        "AnnotationMovedInSameParent",
        "AnnotationMovedAndReplacedFromOtherParent",
        "AnnotationMovedAndReplacedInSameParent",
        "ReferenceAdded",
        "ReferenceDeleted",
        "ReferenceChanged",
        "EntryMovedFromOtherReference",
        "EntryMovedFromOtherReferenceInSameParent",
        "EntryMovedInSameReference",
        "EntryMovedAndReplacedFromOtherReference",
        "EntryMovedAndReplacedFromOtherReferenceInSameParent",
        "EntryMovedAndReplacedInSameReference",
        "ReferenceResolveInfoAdded",
        "ReferenceResolveInfoDeleted",
        "ReferenceResolveInfoChanged",
        "ReferenceTargetAdded",
        "ReferenceTargetDeleted",
        "ReferenceTargetChanged",
        "CompositeEvent",
        "NoOp",
        "Error"
    ],
    (messageKind) => messageKind,
    (_) => true
)

export const isEvent = (message: Message): message is Event =>
    message.messageKind in eventMessageKinds

