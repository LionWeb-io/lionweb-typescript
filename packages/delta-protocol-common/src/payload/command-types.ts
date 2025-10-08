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
import { DeltaProtocolMessage } from "./common.js"

export interface Command extends DeltaProtocolMessage {
    commandId: LionWebId
}


// in order of the specification (§ 6.5):

/** § 6.5.2.1 */
export interface AddPartitionCommand extends Command {
    messageKind: "AddPartition"
    newPartition: LionWebJsonChunk
}

/** § 6.5.2.2 */
export interface DeletePartitionCommand extends Command {
    messageKind: "DeletePartition"
    deletedPartition: LionWebId
}

/** § 6.5.3.1 */
export interface ChangeClassifierCommand extends Command {
    messageKind: "ChangeClassifier"
    node: LionWebId
    newClassifier: LionWebJsonMetaPointer
}

/** § 6.5.4.1 */
export interface AddPropertyCommand<T> extends Command {
    messageKind: "AddProperty"
    node: LionWebId
    property: LionWebJsonMetaPointer
    newValue: T
}

/** § 6.5.4.2 */
export interface DeletePropertyCommand extends Command {
    messageKind: "DeleteProperty"
    node: LionWebId
    property: LionWebJsonMetaPointer
}

/** § 6.5.4.3 */
export interface ChangePropertyCommand<T> extends Command {
    messageKind: "ChangeProperty"
    node: LionWebId
    property: LionWebJsonMetaPointer
    newValue: T
}

/** § 6.5.5.1 */
export interface AddChildCommand extends Command {
    messageKind: "AddChild"
    parent: LionWebId
    newChild: LionWebJsonChunk
    containment: LionWebJsonMetaPointer
    index: number
}

/** § 6.5.5.2 */
export interface DeleteChildCommand extends Command {
    messageKind: "DeleteChild"
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    index: number
    deletedChild: LionWebId
}

/** § 6.5.5.3 */
export interface ReplaceChildCommand extends Command {
    messageKind: "ReplaceChild"
    newChild: LionWebJsonChunk
    parent: LionWebId
    containment: LionWebJsonMetaPointer
    index: number
    replacedChild: LionWebId
}

/** § 6.5.5.4 */
export interface MoveChildFromOtherContainmentCommand extends Command {
    messageKind: "MoveChildFromOtherContainment"
    newParent: LionWebId
    newContainment: LionWebJsonMetaPointer
    newIndex: number
    movedChild: LionWebId
}

/** § 6.5.5.5 */
export interface MoveChildFromOtherContainmentInSameParentCommand extends Command {
    messageKind: "MoveChildFromOtherContainmentInSameParent"
    newContainment: LionWebJsonMetaPointer
    newIndex: number
    movedChild: LionWebId
    parent: LionWebId
    oldContainment: LionWebJsonMetaPointer
    oldIndex: number
}

/** § 6.5.5.6 */
export interface MoveChildInSameContainmentCommand extends Command {
    messageKind: "MoveChildInSameContainment"
    newIndex: number
    movedChild: LionWebId
}

/** § 6.5.5.7 */
export interface MoveAndReplaceChildFromOtherContainmentCommand extends Command {
    messageKind: "MoveAndReplaceChildFromOtherContainment"
    newParent: LionWebId
    newContainment: LionWebJsonMetaPointer
    newIndex: number
    replacedChild: LionWebId
    movedChild: LionWebId
}

/** § 6.5.5.8 */
export interface MoveAndReplaceChildFromOtherContainmentInSameParentCommand extends Command {
    messageKind: "MoveAndReplaceChildFromOtherContainmentInSameParent"
    newContainment: LionWebJsonMetaPointer
    newIndex: number
    replacedChild: LionWebId
    movedChild: LionWebId
}

/** § 6.5.5.9 */
export interface MoveAndReplaceChildInSameContainmentCommand extends Command {
    messageKind: "MoveAndReplaceChildInSameContainment"
    newIndex: number
    replacedChild: LionWebId
}

/** § 6.5.6.1 */
export interface AddAnnotationCommand extends Command {
    messageKind: "AddAnnotation"
    parent: LionWebId
    newAnnotation: LionWebJsonChunk
    index: number
}

/** § 6.5.6.2 */
export interface DeleteAnnotationCommand extends Command {
    messageKind: "DeleteAnnotation"
    parent: LionWebId
    index: number
    deletedAnnotation: LionWebId
}

/** § 6.5.6.3 */
export interface ReplaceAnnotationCommand extends Command {
    messageKind: "ReplaceAnnotation"
    newAnnotation: LionWebJsonChunk
    parent: LionWebId
    index: number
    replacedAnnotation: LionWebId
}

/** § 6.5.6.4 */
export interface MoveAnnotationFromOtherParentCommand extends Command {
    messageKind: "MoveAnnotationFromOtherParent"
    newParent: LionWebId
    newIndex: number
    movedAnnotation: LionWebId
}

/** § 6.5.6.5 */
export interface MoveAnnotationInSameParentCommand extends Command {
    messageKind: "MoveAnnotationInSameParent"
    newIndex: number
    movedAnnotation: LionWebId
}

/** § 6.5.6.6 */
export interface MoveAndReplaceAnnotationFromOtherParentCommand extends Command {
    messageKind: "MoveAndReplaceAnnotationFromOtherParent"
    newParent: LionWebId
    newIndex: number
    replacedAnnotation: LionWebId
    movedAnnotation: LionWebId
}

/** § 6.5.6.7 */
export interface MoveAndReplaceAnnotationInSameParentCommand extends Command {
    messageKind: "MoveAndReplaceAnnotationInSameParent"
    newIndex: number
    replacedAnnotation: LionWebId
    movedAnnotation: LionWebId
}

/** § 6.5.7.1 */
export interface AddReferenceCommand extends Command {
    messageKind: "AddReference"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    newTarget: LionWebId | null
    newResolveInfo: string | null
}

/** § 6.5.7.2 */
export interface DeleteReferenceCommand extends Command {
    messageKind: "DeleteReference"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    deletedTarget: LionWebId | null
    deletedResolveInfo: string | null
}

/** § 6.5.7.3 */
export interface ChangeReferenceCommand extends Command {
    messageKind: "ChangeReference"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    oldTarget: LionWebId | null
    oldResolveInfo: string | null
    newTarget: LionWebId | null
    newResolveInfo: string | null
}

/** § 6.5.7.4 */
export interface MoveEntryFromOtherReferenceCommand extends Command {
    messageKind: "MoveEntryFromOtherReference"
    newParent: LionWebId
    newReference: LionWebJsonMetaPointer
    newIndex: number
    oldParent: LionWebId
    oldReference: LionWebJsonMetaPointer
    oldIndex: number
    movedTarget: LionWebId | null
    movedResolveInfo: string | null
}

/** § 6.5.7.5 */
export interface MoveEntryFromOtherReferenceInSameParentCommand extends Command {
    messageKind: "MoveEntryFromOtherReferenceInSameParent"
    parent: LionWebId
    newReference: LionWebJsonMetaPointer
    newIndex: number
    oldIndex: number
    movedTarget: LionWebId | null
    movedResolveInfo: string | null
}

/** § 6.5.7.6 */
export interface MoveEntryInSameReferenceCommand extends Command {
    messageKind: "MoveEntryInSameReference"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    oldIndex: number
    newIndex: number
    movedTarget: LionWebId | null
    movedResolveInfo: string | null
}

/** § 6.5.7.7 */
export interface MoveAndReplaceEntryFromOtherReferenceCommand extends Command {
    messageKind: "MoveAndReplaceEntryFromOtherReference"
    newParent: LionWebId
    newReference: LionWebJsonMetaPointer
    newIndex: number
    replacedTarget: LionWebId | null
    replacedResolveInfo: string | null
    oldParent: LionWebId
    oldReference: LionWebJsonMetaPointer
    oldIndex: number
    movedTarget: LionWebId | null
    movedResolveInfo: string | null
}

/** § 6.5.7.8 */
export interface MoveAndReplaceEntryFromOtherReferenceInSameParentCommand extends Command {
    messageKind: "MoveAndReplaceEntryFromOtherReferenceInSameParent"
    parent: LionWebId
    newReference: LionWebJsonMetaPointer
    newIndex: number
    replacedTarget: LionWebId | null
    replacedResolveInfo: string | null
    oldReference: LionWebJsonMetaPointer
    oldIndex: number
    movedTarget: LionWebId | null
    movedResolveInfo: string | null
}

/** § 6.5.7.9 */
export interface MoveAndReplaceEntryInSameReferenceCommand extends Command {
    messageKind: "MoveAndReplaceEntryInSameReference"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    oldIndex: number
    movedTarget: LionWebId | null
    movedResolveInfo: string | null
    newIndex: number
    replacedTarget: LionWebId | null
    replacedResolveInfo: string | null
}

/** § 6.5.7.10 */
export interface AddReferenceResolveInfoCommand extends Command {
    messageKind: "AddReferenceResolveInfo"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    newResolveInfo: string
}

/** § 6.5.7.11 */
export interface DeleteReferenceResolveInfoCommand extends Command {
    messageKind: "DeleteReferenceResolveInfo"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    deletedResolveInfo: string
}

/** § 6.5.7.12 */
export interface ChangeReferenceResolveInfoCommand extends Command {
    messageKind: "ChangeReferenceResolveInfo"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    oldResolveInfo: string
    newResolveInfo: string
}

/** § 6.5.7.13 */
export interface AddReferenceTargetCommand extends Command {
    messageKind: "AddReferenceTarget"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    newTarget: LionWebId
}

/** § 6.5.7.14 */
export interface DeleteReferenceTargetCommand extends Command {
    messageKind: "DeleteReferenceTarget"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    deletedTarget: LionWebId
}

/** § 6.5.7.15 */
export interface ChangeReferenceTargetCommand extends Command {
    messageKind: "ChangeReferenceTarget"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    oldTarget: LionWebId
    newTarget: LionWebId
}

/** § 6.5.8.1 */
export interface CompositeCommand extends Command {
    messageKind: "CompositeCommand"
    parts: Command[]
}

