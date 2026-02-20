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
    AddAnnotationCommand,
    AddChildCommand,
    AddPartitionCommand,
    AddPropertyCommand,
    AddReferenceCommand,
    AnnotationAddedEvent,
    AnnotationDeletedEvent,
    AnnotationMovedAndReplacedFromOtherParentEvent,
    AnnotationMovedAndReplacedInSameParentEvent,
    AnnotationMovedFromOtherParentEvent,
    AnnotationMovedInSameParentEvent,
    AnnotationReplacedEvent,
    ChangeClassifierCommand,
    ChangePropertyCommand,
    ChangeReferenceCommand,
    ChildAddedEvent,
    ChildDeletedEvent,
    ChildMovedAndReplacedFromOtherContainmentEvent,
    ChildMovedAndReplacedFromOtherContainmentInSameParentEvent,
    ChildMovedAndReplacedInSameContainmentEvent,
    ChildMovedFromOtherContainmentEvent,
    ChildMovedFromOtherContainmentInSameParentEvent,
    ChildMovedInSameContainmentEvent,
    ChildReplacedEvent,
    ClassifierChangedEvent,
    Command,
    CompositeCommand,
    CompositeEvent,
    DeleteAnnotationCommand,
    DeleteChildCommand,
    DeletePartitionCommand,
    DeletePropertyCommand,
    DeleteReferenceCommand,
    Event,
    MoveAndReplaceAnnotationFromOtherParentCommand,
    MoveAndReplaceAnnotationInSameParentCommand,
    MoveAndReplaceChildFromOtherContainmentCommand,
    MoveAndReplaceChildFromOtherContainmentInSameParentCommand,
    MoveAndReplaceChildInSameContainmentCommand,
    MoveAnnotationFromOtherParentCommand,
    MoveAnnotationInSameParentCommand,
    MoveChildFromOtherContainmentCommand,
    MoveChildFromOtherContainmentInSameParentCommand,
    MoveChildInSameContainmentCommand,
    PartitionAddedEvent,
    PartitionDeletedEvent,
    PropertyAddedEvent,
    PropertyChangedEvent,
    PropertyDeletedEvent,
    ReferenceAddedEvent,
    ReferenceChangedEvent,
    ReferenceDeletedEvent,
    ReplaceAnnotationCommand,
    ReplaceChildCommand
} from "@lionweb/delta-protocol-common"

/**
 * @return the {@link Command command}, as issued by a client with the given `participationId`, as an {@link Event event}.
 */
export const commandAsEvent = (command: Command, participationId: string): Event => {

    // TODO  make dependent on which participationId the event is sent _to_
    const participation2nextSequenceNumber: { [participationId: string]: number } = {}
    const nextSequenceNumber = () => {
        if (!(participationId in participation2nextSequenceNumber)) {
            participation2nextSequenceNumber[participationId] = -1
        }
        return ++participation2nextSequenceNumber[participationId]
    }

    const completed = <ET extends Event>(
            eventName: ET["messageKind"],
            partialEvent: Omit<ET, "messageKind" | "originCommands" | "sequenceNumber" | "additionalInfos">
    ): Event => ({
        messageKind: eventName,
        ...partialEvent,
        originCommands: [
            {
                participationId,
                commandId: command.commandId
            }
        ],
        sequenceNumber: nextSequenceNumber(),
        additionalInfos: command.additionalInfos
    })

    const commandAsEvent_ = (command: Command): Event => {
        switch (command.messageKind) {

            // in order of the specification (§ 5.5):

            case "AddPartition": {
                const {newPartition} = command as AddPartitionCommand // § 5.6.2.1
                return completed<PartitionAddedEvent>("PartitionAdded", { // § 5.7.1.1
                    newPartition
                })
            }
            case "DeletePartition": {
                const {deletedPartition} = command as DeletePartitionCommand // § 5.6.2.2
                return completed<PartitionDeletedEvent>("PartitionDeleted", { // § 5.7.1.2
                    deletedPartition
                })
            }
            case "ChangeClassifier": {
                const {node, newClassifier} = command as ChangeClassifierCommand // § 5.6.3.1
                return completed<ClassifierChangedEvent>("ClassifierChanged", { // § 5.7.2.1
                    node,
                    newClassifier,
                    oldClassifier:  { language: "???", version: "???", key: "???" },  // TODO  get from own model
                })
            }
            case "AddProperty": {
                const {node, property, newValue} = command as AddPropertyCommand // § 5.6.4.1
                return completed<PropertyAddedEvent>("PropertyAdded", { // § 5.7.3.1
                    node,
                    property,
                    newValue
                })
            }
            case "DeleteProperty": {
                const {node, property} = command as DeletePropertyCommand // § 5.6.4.2
                return completed<PropertyDeletedEvent>("PropertyDeleted", { // § 5.7.3.2
                    node,
                    property,
                    oldValue: "???" // TODO  get from own model
                })
            }
            case "ChangeProperty": {
                const {node, property, newValue} = command as ChangePropertyCommand // § 5.6.4.3
                return completed<PropertyChangedEvent>("PropertyChanged", { // § 5.7.3.3
                    node,
                    property,
                    newValue,
                    oldValue: "???", // TODO  get from own model
                })
            }
            case "AddChild": {
                const {parent, newChild, containment, index} = command as AddChildCommand // § 5.6.5.1
                return completed<ChildAddedEvent>("ChildAdded", { // § 5.7.4.1
                    parent,
                    newChild,
                    containment,
                    index
                })
            }
            case "DeleteChild": {
                const {parent, containment, index, deletedChild} = command as DeleteChildCommand // § 5.6.5.2
                return completed<ChildDeletedEvent>("ChildDeleted", { // § 5.7.4.2
                    parent,
                    containment,
                    index,
                    deletedChild,
                    deletedDescendants: []  // TODO  get from own model
                })
            }
            case "ReplaceChild": {
                const {newChild, parent, containment, index, replacedChild} = command as ReplaceChildCommand // § 5.6.5.3
                return completed<ChildReplacedEvent>("ChildReplaced", { // § 5.7.4.3
                    newChild,
                    replacedChild,
                    replacedDescendants: [],    // TODO  get from own model
                    parent,
                    containment,
                    index
                })
            }
            case "MoveChildFromOtherContainment": {
                const {newParent, newContainment, newIndex, movedChild} = command as MoveChildFromOtherContainmentCommand // § 5.6.5.4
                return completed<ChildMovedFromOtherContainmentEvent>("ChildMovedFromOtherContainment", { // § 5.7.4.4
                    newParent,
                    newContainment,
                    newIndex,
                    movedChild,
                    oldParent: "???",   // TODO  get from own model
                    oldContainment: newContainment, // TODO  get from own model
                    oldIndex: -1 // TODO  get from own model
                })
            }
            case "MoveChildFromOtherContainmentInSameParent": {
                const {parent, oldContainment, oldIndex, newContainment, newIndex, movedChild} = command as MoveChildFromOtherContainmentInSameParentCommand // § 5.6.5.5
                return completed<ChildMovedFromOtherContainmentInSameParentEvent>("ChildMovedFromOtherContainmentInSameParent", { // § 5.7.4.5
                    parent,
                    oldContainment,
                    oldIndex,
                    newContainment,
                    newIndex,
                    movedChild
                })
            }
            case "MoveChildInSameContainment": {
                const {newIndex, movedChild} = command as MoveChildInSameContainmentCommand // § 5.6.5.6
                return completed<ChildMovedInSameContainmentEvent>("ChildMovedInSameContainment", { // § 5.7.4.6
                    newIndex,
                    movedChild,
                    parent: "???",   // TODO  get from own model
                    containment: { language: "???", version: "???", key: "???" },  // TODO  get from own model
                    oldIndex: -1 // TODO  get from own model
                })
            }
            case "MoveAndReplaceChildFromOtherContainment": {
                const {newParent, newContainment, newIndex, replacedChild, movedChild} = command as MoveAndReplaceChildFromOtherContainmentCommand // § 5.6.5.7
                return completed<ChildMovedAndReplacedFromOtherContainmentEvent>("ChildMovedAndReplacedFromOtherContainment", { // § 5.7.4.7
                    newParent,
                    newContainment,
                    newIndex,
                    movedChild,
                    oldParent: newParent,   // TODO  get from own model
                    oldContainment: newContainment,   // TODO  get from own model
                    oldIndex: -1,   // TODO  get from own model
                    replacedChild,
                    replacedDescendants: []   // TODO  get from own model
                })
            }
            case "MoveAndReplaceChildFromOtherContainmentInSameParent": {
                const {newContainment, newIndex, replacedChild, movedChild} = command as MoveAndReplaceChildFromOtherContainmentInSameParentCommand // § 5.6.5.8
                return completed<ChildMovedAndReplacedFromOtherContainmentInSameParentEvent>("ChildMovedAndReplacedFromOtherContainmentInSameParent", { // § 5.7.4.8
                    newContainment,
                    newIndex,
                    movedChild,
                    parent: "???",   // TODO  get from own model
                    oldContainment: newContainment,   // TODO  get from own model
                    oldIndex: -1,   // TODO  get from own model
                    replacedChild: replacedChild,
                    replacedDescendants: []   // TODO  get from own model
                })
            }
            case "MoveAndReplaceChildInSameContainment": {
                const {newIndex, replacedChild} = command as MoveAndReplaceChildInSameContainmentCommand // § 5.6.5.9
                return completed<ChildMovedAndReplacedInSameContainmentEvent>("ChildMovedAndReplacedInSameContainment", { // § 5.7.4.9
                    newIndex,
                    movedChild: "???",   // TODO  get from own model
                    parent: "???",   // TODO  get from own model
                    containment: { language: "???", version: "???", key: "???" },   // TODO  get from own model
                    oldIndex: -1,   // TODO  get from own model
                    replacedChild,
                    replacedDescendants: []   // TODO  get from own model
                })
            }
            case "AddAnnotation": {
                const {parent, newAnnotation, index} = command as AddAnnotationCommand // § 5.6.6.1
                return completed<AnnotationAddedEvent>("AnnotationAdded", { // § 5.7.5.1
                    parent,
                    newAnnotation,
                    index
                })
            }
            case "DeleteAnnotation": {
                const {deletedAnnotation, parent, index} = command as DeleteAnnotationCommand // § 5.6.6.2
                return completed<AnnotationDeletedEvent>("AnnotationDeleted", { // § 5.7.5.2
                    deletedAnnotation,
                    deletedDescendants: [],   // TODO  get from own model
                    parent,
                    index
                })
            }
            case "ReplaceAnnotation": {
                const {newAnnotation, replacedAnnotation, parent, index} = command as ReplaceAnnotationCommand // § 5.6.6.3
                return completed<AnnotationReplacedEvent>("AnnotationReplaced", { // § 5.7.5.3
                    newAnnotation,
                    replacedAnnotation,
                    replacedDescendants: [],   // TODO  get from own model
                    parent,
                    index
                })
            }
            case "MoveAnnotationFromOtherParent": {
                const {newParent, newIndex, movedAnnotation} = command as MoveAnnotationFromOtherParentCommand // § 5.6.6.4
                return completed<AnnotationMovedFromOtherParentEvent>("AnnotationMovedFromOtherParent", { // § 5.7.5.4
                    newParent,
                    newIndex,
                    movedAnnotation,
                    oldParent: "???",   // TODO  get from own model
                    oldIndex: -1   // TODO  get from own model
                })
            }
            case "MoveAnnotationInSameParent": {
                const {newIndex, movedAnnotation} = command as MoveAnnotationInSameParentCommand // § 5.6.6.5
                return completed<AnnotationMovedInSameParentEvent>("AnnotationMovedInSameParent", { // § 5.7.5.5
                    newIndex,
                    movedAnnotation,
                    parent: "???",   // TODO  get from own model
                    oldIndex: -1   // TODO  get from own model
                })
            }
            case "MoveAndReplaceAnnotationFromOtherParent": {
                const {newParent, newIndex, movedAnnotation, replacedAnnotation} = command as MoveAndReplaceAnnotationFromOtherParentCommand // § 5.6.6.6
                return completed<AnnotationMovedAndReplacedFromOtherParentEvent>("AnnotationMovedAndReplacedFromOtherParent", { // § 5.7.5.6
                    newParent,
                    newIndex,
                    movedAnnotation,
                    oldParent: "???",   // TODO  get from own model
                    oldIndex: -1,   // TODO  get from own model
                    replacedAnnotation,
                    replacedDescendants: []   // TODO  get from own model
                })
            }
            case "MoveAndReplaceAnnotationInSameParent": {
                const {newIndex, movedAnnotation, replacedAnnotation} = command as MoveAndReplaceAnnotationInSameParentCommand // § 5.6.6.7
                return completed<AnnotationMovedAndReplacedInSameParentEvent>("AnnotationMovedAndReplacedInSameParent", { // § 5.7.5.7
                    newIndex,
                    movedAnnotation,
                    parent: "???",   // TODO  get from own model
                    oldIndex: -1,   // TODO  get from own model
                    replacedAnnotation,
                    replacedDescendants: []   // TODO  get from own model
                })
            }
            case "AddReference": {
                const {parent, reference, index, newReference, newResolveInfo} = command as AddReferenceCommand // § 5.6.7.1
                return completed<ReferenceAddedEvent>("ReferenceAdded", { // § 5.7.6.1
                    parent,
                    reference,
                    index,
                    newReference,
                    newResolveInfo
                })
            }
            case "DeleteReference": {
                const {parent, reference, index, deletedReference, deletedResolveInfo} = command as DeleteReferenceCommand // § 5.6.7.2
                return completed<ReferenceDeletedEvent>("ReferenceDeleted", { // § 5.7.6.2
                    parent,
                    reference,
                    index,
                    deletedReference,
                    deletedResolveInfo
                })
            }
            case "ChangeReference": {
                const {parent, reference, index, newReference, newResolveInfo, oldReference, oldResolveInfo} = command as ChangeReferenceCommand // § 5.6.7.3
                return completed<ReferenceChangedEvent>("ReferenceChanged", { // § 5.7.6.3
                    parent,
                    reference,
                    index,
                    newReference,
                    newResolveInfo,
                    oldReference,
                    oldResolveInfo
                })
            }
            case "CompositeCommand": {
                const {parts} = command as CompositeCommand // § 5.6.8.1
                return completed<CompositeEvent>("CompositeEvent", { // § 5.7.7.1
                    parts: parts.map(commandAsEvent_)
                })
            }
            // Note: no command translates into a NoOpEvent, and ErrorEvent-s correspond to faults.

            default:
                throw new Error(`can't handle command of kind ${command.messageKind}`)
        }

    }

    return commandAsEvent_(command)

}

