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

import { LionWebId, LionWebJsonDeltaChunk, LionWebJsonMetaPointer } from "@lionweb/json"
import { mapFrom } from "@lionweb/ts-utils"
import { ContinuedChunkMessage, CustomMessageKind, DeltaAdditionalInfo, Message, SplittableMessage } from "./common.js"

export type CommandSource = {
    participationId: LionWebId
    commandId: LionWebId
}

export interface Event extends DeltaAdditionalInfo {
    sequenceNumber: number
    originCommands: CommandSource[]
}


/**
 * “Abstract” interface for custom events.
 *
 * § 5.3.3
 */
export interface CustomEvent extends Event {
    messageKind: CustomMessageKind
}


// in order of the specification (§ 5.8):

/**
 * § 5.8.1
 */
export interface ContinuedEvent extends Event, ContinuedChunkMessage {
    messageKind: "ContinuedEvent"
    continuedEventSequenceNumber: number  // === sequence number of split event (i.e., the initial message)
}

/** § 5.8.2.1 */
export interface PartitionAddedEvent extends Event, SplittableMessage {
    messageKind: "PartitionAdded"
    newPartition: /* single or shallow */ LionWebJsonDeltaChunk
}

/** § 5.8.2.2 */
export interface PartitionDeletedEvent extends Event {
    messageKind: "PartitionDeleted"
    deletedPartition: LionWebId
    deletedDescendants: LionWebId[]
}

/** § 5.8.3.1 */
export interface ClassifierChangedEvent extends Event {
    messageKind: "ClassifierChanged"
    node: LionWebId
    newClassifier: LionWebJsonMetaPointer
    oldClassifier: LionWebJsonMetaPointer
}

/** § 5.8.4.1 */
export interface PropertyAddedEvent extends Event {
    messageKind: "PropertyAdded"
    node: LionWebId
    property: LionWebJsonMetaPointer
    newValue: string
}

/** § 5.8.4.2 */
export interface PropertyDeletedEvent extends Event {
    messageKind: "PropertyDeleted"
    node: LionWebId
    property: LionWebJsonMetaPointer
    oldValue: string
}

/** § 5.8.4.3 */
export interface PropertyChangedEvent extends Event {
    messageKind: "PropertyChanged"
    node: LionWebId
    property: LionWebJsonMetaPointer
    oldValue: string
    newValue: string
}

/** § 5.8.5.1 */
export interface ChildAddedEvent extends Event, SplittableMessage {
    messageKind: "ChildAdded"
    parent: LionWebId
    newChild: /* single */ LionWebJsonDeltaChunk
    containment: LionWebJsonMetaPointer
    index: number
}

/** § 5.8.5.2 */
export interface ChildDeletedEvent extends Event {
    messageKind: "ChildDeleted"
    deletedChild: LionWebId
    deletedDescendants: LionWebId[]
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    index: number
}

/** § 5.8.5.3 */
export interface ChildReplacedEvent extends Event, SplittableMessage {
    messageKind: "ChildReplaced"
    newChild: /* single */ LionWebJsonDeltaChunk
    replacedChild: LionWebId
    replacedDescendants: LionWebId[]
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    index: number
}

/** § 5.8.5.4 */
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

/** § 5.8.5.5 */
export interface ChildMovedFromOtherContainmentInSameParentEvent extends Event {
    messageKind: "ChildMovedFromOtherContainmentInSameParent"
    newContainment: LionWebJsonMetaPointer
    newIndex: number
    movedChild: LionWebId
    parent: LionWebId
    oldContainment: LionWebJsonMetaPointer
    oldIndex: number
}

/** § 5.8.5.6 */
export interface ChildMovedInSameContainmentEvent extends Event {
    messageKind: "ChildMovedInSameContainment"
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    oldIndex: number
    indexOffset: number
    movedChild: LionWebId
}

/** § 5.8.5.7 */
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

/** § 5.8.5.8 */
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

/** § 5.8.5.9 */
export interface ChildMovedAndReplacedInSameContainmentEvent extends Event {
    messageKind: "ChildMovedAndReplacedInSameContainment"
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    oldIndex: number
    indexOffset: number
    movedChild: LionWebId
    replacedChild: LionWebId
    replacedDescendants: LionWebId[]
}

/** § 5.8.6.1 */
export interface AnnotationAddedEvent extends Event, SplittableMessage {
    messageKind: "AnnotationAdded"
    parent: LionWebId
    newAnnotation: /* single */ LionWebJsonDeltaChunk
    index: number
}

/** § 5.8.6.2 */
export interface AnnotationDeletedEvent extends Event {
    messageKind: "AnnotationDeleted"
    deletedAnnotation: LionWebId
    deletedDescendants: LionWebId[]
    parent: LionWebId
    index: number
}

/** § 5.8.6.3 */
export interface AnnotationReplacedEvent extends Event, SplittableMessage {
    messageKind: "AnnotationReplaced"
    newAnnotation: /* single */ LionWebJsonDeltaChunk
    replacedAnnotation: LionWebId
    replacedDescendants: LionWebId[]
    parent: LionWebId
    index: number
}

/** § 5.8.6.4 */
export interface AnnotationMovedFromOtherParentEvent extends Event {
    messageKind: "AnnotationMovedFromOtherParent"
    newParent: LionWebId
    newIndex: number
    movedAnnotation: LionWebId
    oldParent: LionWebId
    oldIndex: number
}

/** § 5.8.6.5 */
export interface AnnotationMovedInSameParentEvent extends Event {
    messageKind: "AnnotationMovedInSameParent"
    parent: LionWebId
    oldIndex: number
    indexOffset: number
    movedAnnotation: LionWebId
}

/** § 5.8.6.6 */
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

/** § 5.8.6.7 */
export interface AnnotationMovedAndReplacedInSameParentEvent extends Event {
    messageKind: "AnnotationMovedAndReplacedInSameParent"
    parent: LionWebId
    oldIndex: number
    indexOffset: number
    movedAnnotation: LionWebId
    replacedAnnotation: LionWebId
    replacedDescendants: LionWebId[]
}

/** § 5.8.7.1 */
export interface ReferenceAddedEvent extends Event {
    messageKind: "ReferenceAdded"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    newReference?: LionWebId | null
    newResolveInfo?: string | null
}

/** § 5.8.7.2 */
export interface ReferenceDeletedEvent extends Event {
    messageKind: "ReferenceDeleted"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    deletedReference?: LionWebId | null
    deletedResolveInfo?: string | null
}

/** § 5.8.7.3 */
export interface ReferenceChangedEvent extends Event {
    messageKind: "ReferenceChanged"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    newReference?: LionWebId | null
    newResolveInfo?: string | null
    oldReference?: LionWebId | null
    oldResolveInfo?: string | null
}

/** § 5.8.8.1 */
export interface CompositeEvent extends Event {
    messageKind: "CompositeEvent"
    parts: Event[]
}

/** § 5.8.8.2 */
export interface NoOpEvent extends Event {
    messageKind: "NoOpEvent"
}

/** § 5.8.8.3 */
export interface ErrorEvent extends Event {
    messageKind: "ErrorEvent"
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
        "ContinuedEvent",
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
        "CompositeEvent",
        "NoOpEvent",
        "ErrorEvent"
    ],
    (messageKind) => messageKind,
    (_) => true
)

export const isEvent = (message: Message): message is Event =>
    message.messageKind in eventMessageKinds

export const isContinuedEvent = (message: Message): message is ContinuedEvent =>
    message.messageKind === "ContinuedEvent"

/**
 * (See § 3.7.1 of the specification of the delta protocol.)
 *
 * @return the name of the property of the given {@link Event} that holds the chunk that may be split, or `undefined` if the given `event` isn’t splittable.
 */
export const maybeChunkPropertyForSplittableEvent = (event: Event): (string | undefined) => {
    switch (event.messageKind) {
        case "PartitionAdded": return "newPartition"
        case "ChildAdded": return "newChild"
        case "ChildReplaced": return "newChild"
        case "AnnotationAdded": return "newAnnotation"
        case "AnnotationReplaced": return "newAnnotation"
        default: return undefined
    }
}

