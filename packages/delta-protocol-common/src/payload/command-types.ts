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
export interface AddPropertyCommand extends Command {
    messageKind: "AddProperty"
    node: LionWebId
    property: LionWebJsonMetaPointer
    newValue: string
}

/** § 6.5.4.2 */
export interface DeletePropertyCommand extends Command {
    messageKind: "DeleteProperty"
    node: LionWebId
    property: LionWebJsonMetaPointer
}

/** § 6.5.4.3 */
export interface ChangePropertyCommand extends Command {
    messageKind: "ChangeProperty"
    node: LionWebId
    property: LionWebJsonMetaPointer
    newValue: string
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
    newTarget: LionWebId | null | undefined
    newResolveInfo: string | null | undefined
}

/** § 6.5.7.2 */
export interface DeleteReferenceCommand extends Command {
    messageKind: "DeleteReference"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    deletedTarget: LionWebId | null | undefined
    deletedResolveInfo: string | null | undefined
}

/** § 6.5.7.3 */
export interface ChangeReferenceCommand extends Command {
    messageKind: "ChangeReference"
    parent: LionWebId
    reference: LionWebJsonMetaPointer
    index: number
    oldTarget: LionWebId | null | undefined
    oldResolveInfo: string | null | undefined
    newTarget: LionWebId | null | undefined
    newResolveInfo: string | null | undefined
}

/** § 6.5.8.1 */
export interface CompositeCommand extends Command {
    messageKind: "CompositeCommand"
    parts: Command[]
}

