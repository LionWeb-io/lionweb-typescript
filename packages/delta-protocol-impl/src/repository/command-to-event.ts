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
    AddReferenceResolveInfoCommand,
    AddReferenceTargetCommand,
    ChangeClassifierCommand,
    ChangePropertyCommand,
    ChangeReferenceCommand,
    ChangeReferenceResolveInfoCommand,
    ChangeReferenceTargetCommand,
    Command,
    CompositeCommand,
    DeleteAnnotationCommand,
    DeleteChildCommand,
    DeletePartitionCommand,
    DeletePropertyCommand,
    DeleteReferenceCommand,
    DeleteReferenceResolveInfoCommand,
    DeleteReferenceTargetCommand,
    MoveAndReplaceAnnotationFromOtherParentCommand,
    MoveAndReplaceAnnotationInSameParentCommand,
    MoveAndReplaceChildFromOtherContainmentCommand,
    MoveAndReplaceChildFromOtherContainmentInSameParentCommand,
    MoveAndReplaceChildInSameContainmentCommand,
    MoveAndReplaceEntryFromOtherReferenceCommand,
    MoveAndReplaceEntryFromOtherReferenceInSameParentCommand,
    MoveAndReplaceEntryInSameReferenceCommand,
    MoveAnnotationFromOtherParentCommand,
    MoveAnnotationInSameParentCommand,
    MoveChildFromOtherContainmentCommand,
    MoveChildFromOtherContainmentInSameParentCommand,
    MoveChildInSameContainmentCommand,
    MoveEntryFromOtherReferenceCommand,
    MoveEntryFromOtherReferenceInSameParentCommand,
    MoveEntryInSameReferenceCommand,
    ReplaceAnnotationCommand,
    ReplaceChildCommand
} from "../payload/command-types.js"
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
    ClassifierChangedEvent,
    CompositeEvent,
    EntryMovedAndReplacedFromOtherReferenceEvent,
    EntryMovedAndReplacedFromOtherReferenceInSameParentEvent,
    EntryMovedAndReplacedInSameReferenceEvent,
    EntryMovedFromOtherReferenceEvent,
    EntryMovedFromOtherReferenceInSameParentEvent,
    EntryMovedInSameReferenceEvent,
    Event,
    PartitionAddedEvent,
    PartitionDeletedEvent,
    PropertyAddedEvent,
    PropertyChangedEvent,
    PropertyDeletedEvent,
    ReferenceAddedEvent,
    ReferenceChangedEvent,
    ReferenceDeletedEvent,
    ReferenceResolveInfoAddedEvent,
    ReferenceResolveInfoChangedEvent,
    ReferenceResolveInfoDeletedEvent,
    ReferenceTargetAddedEvent,
    ReferenceTargetChangedEvent,
    ReferenceTargetDeletedEvent
} from "../payload/event-types.js"

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
            partialEvent: Omit<ET, "messageKind" | "originCommands" | "sequenceNumber" | "protocolMessages">
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
        protocolMessages: command.protocolMessages
    })

    const commandAsEvent_ = (command: Command): Event => {
        switch (command.messageKind) {

            // in order of the specification (§ 6.5):

            case "AddPartition": {
                const {newPartition} = command as AddPartitionCommand // § 6.5.2.1
                return completed<PartitionAddedEvent>("PartitionAdded", { // § 6.6.1.1
                    newPartition
                })
            }
            case "DeletePartition": {
                const {deletedPartition} = command as DeletePartitionCommand // § 6.5.2.2
                return completed<PartitionDeletedEvent>("PartitionDeleted", { // § 6.6.1.2
                    deletedPartition
                })
            }
            case "ChangeClassifier": {
                const {node, newClassifier} = command as ChangeClassifierCommand // § 6.5.3.1
                return completed<ClassifierChangedEvent>("ClassifierChanged", { // § 6.6.2.1
                    node,
                    newClassifier,
                    oldClassifier:  { language: "???", version: "???", key: "???" },  // TODO  get from own model
                })
            }
            case "AddProperty": {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const {node, property, newValue} = command as AddPropertyCommand<any> // § 6.5.4.1
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return completed<PropertyAddedEvent<any>>("PropertyAdded", { // § 6.6.3.1
                    node,
                    property,
                    newValue
                })
            }
            case "DeleteProperty": {
                const {node, property} = command as DeletePropertyCommand // § 6.5.4.2
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return completed<PropertyDeletedEvent<any>>("PropertyDeleted", { // § 6.6.3.2
                    node,
                    property,
                    oldValue: "???" // TODO  get from own model
                })
            }
            case "ChangeProperty": {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const {node, property, newValue} = command as ChangePropertyCommand<any> // § 6.5.4.3
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return completed<PropertyChangedEvent<any>>("PropertyChanged", { // § 6.6.3.3
                    node,
                    property,
                    newValue,
                    oldValue: "???", // TODO  get from own model
                })
            }
            case "AddChild": {
                const {parent, newChild, containment, index} = command as AddChildCommand // § 6.5.5.1
                return completed<ChildAddedEvent>("ChildAdded", { // § 6.6.4.1
                    parent,
                    newChild,
                    containment,
                    index
                })
            }
            case "DeleteChild": {
                const {parent, containment, index, deletedChild} = command as DeleteChildCommand // § 6.5.5.2
                return completed<ChildDeletedEvent>("ChildDeleted", { // § 6.6.4.2
                    parent,
                    containment,
                    index,
                    deletedChild,
                    deletedDescendants: []  // TODO  get from own model
                })
            }
            case "ReplaceChild": {
                const {newChild, parent, containment, index, replacedChild} = command as ReplaceChildCommand // § 6.5.5.3
                return completed<ChildReplacedEvent>("ChildReplaced", { // § 6.6.4.3
                    newChild,
                    replacedChild,
                    replacedDescendants: [],    // TODO  get from own model
                    parent,
                    containment,
                    index
                })
            }
            case "MoveChildFromOtherContainment": {
                const {newParent, newContainment, newIndex, movedChild} = command as MoveChildFromOtherContainmentCommand // § 6.5.5.4
                return completed<ChildMovedFromOtherContainmentEvent>("ChildMovedFromOtherContainment", { // § 6.6.4.4
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
                const {parent, oldContainment, oldIndex, newContainment, newIndex, movedChild} = command as MoveChildFromOtherContainmentInSameParentCommand // § 6.5.5.5
                return completed<ChildMovedFromOtherContainmentInSameParentEvent>("ChildMovedFromOtherContainmentInSameParent", { // § 6.6.4.5
                    parent,
                    oldContainment,
                    oldIndex,
                    newContainment,
                    newIndex,
                    movedChild
                })
            }
            case "MoveChildInSameContainment": {
                const {newIndex, movedChild} = command as MoveChildInSameContainmentCommand // § 6.5.5.6
                return completed<ChildMovedInSameContainmentEvent>("ChildMovedInSameContainment", { // § 6.6.4.6
                    newIndex,
                    movedChild,
                    parent: "???",   // TODO  get from own model
                    containment: { language: "???", version: "???", key: "???" },  // TODO  get from own model
                    oldIndex: -1 // TODO  get from own model
                })
            }
            case "MoveAndReplaceChildFromOtherContainment": {
                const {newParent, newContainment, newIndex, replacedChild, movedChild} = command as MoveAndReplaceChildFromOtherContainmentCommand // § 6.5.5.7
                return completed<ChildMovedAndReplacedFromOtherContainmentEvent>("ChildMovedAndReplacedFromOtherContainment", { // § 6.6.4.7
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
                const {newContainment, newIndex, replacedChild, movedChild} = command as MoveAndReplaceChildFromOtherContainmentInSameParentCommand // § 6.5.5.8
                return completed<ChildMovedAndReplacedFromOtherContainmentInSameParentEvent>("ChildMovedAndReplacedFromOtherContainmentInSameParent", { // § 6.6.4.8
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
                const {newIndex, replacedChild} = command as MoveAndReplaceChildInSameContainmentCommand // § 6.5.5.9
                return completed<ChildMovedAndReplacedInSameContainmentEvent>("ChildMovedAndReplacedInSameContainment", { // § 6.6.4.9
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
                const {parent, newAnnotation, index} = command as AddAnnotationCommand // § 6.5.6.1
                return completed<AnnotationAddedEvent>("AnnotationAdded", { // § 6.6.5.1
                    parent,
                    newAnnotation,
                    index
                })
            }
            case "DeleteAnnotation": {
                const {deletedAnnotation, parent, index} = command as DeleteAnnotationCommand // § 6.5.6.2
                return completed<AnnotationDeletedEvent>("AnnotationDeleted", { // § 6.6.5.2
                    deletedAnnotation,
                    deletedDescendants: [],   // TODO  get from own model
                    parent,
                    index
                })
            }
            case "ReplaceAnnotation": {
                const {newAnnotation, replacedAnnotation, parent, index} = command as ReplaceAnnotationCommand // § 6.5.6.3
                return completed<AnnotationReplacedEvent>("AnnotationReplaced", { // § 6.6.5.3
                    newAnnotation,
                    replacedAnnotation,
                    replacedDescendants: [],   // TODO  get from own model
                    parent,
                    index
                })
            }
            case "MoveAnnotationFromOtherParent": {
                const {newParent, newIndex, movedAnnotation} = command as MoveAnnotationFromOtherParentCommand // § 6.5.6.4
                return completed<AnnotationMovedFromOtherParentEvent>("AnnotationMovedFromOtherParent", { // § 6.6.5.4
                    newParent,
                    newIndex,
                    movedAnnotation,
                    oldParent: "???",   // TODO  get from own model
                    oldIndex: -1   // TODO  get from own model
                })
            }
            case "MoveAnnotationInSameParent": {
                const {newIndex, movedAnnotation} = command as MoveAnnotationInSameParentCommand // § 6.5.6.5
                return completed<AnnotationMovedInSameParentEvent>("AnnotationMovedInSameParent", { // § 6.6.5.5
                    newIndex,
                    movedAnnotation,
                    parent: "???",   // TODO  get from own model
                    oldIndex: -1   // TODO  get from own model
                })
            }
            case "MoveAndReplaceAnnotationFromOtherParent": {
                const {newParent, newIndex, movedAnnotation, replacedAnnotation} = command as MoveAndReplaceAnnotationFromOtherParentCommand // § 6.5.6.6
                return completed<AnnotationMovedAndReplacedFromOtherParentEvent>("AnnotationMovedAndReplacedFromOtherParent", { // § 6.6.5.6
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
                const {newIndex, movedAnnotation, replacedAnnotation} = command as MoveAndReplaceAnnotationInSameParentCommand // § 6.5.6.7
                return completed<AnnotationMovedAndReplacedInSameParentEvent>("AnnotationMovedAndReplacedInSameParent", { // § 6.6.5.7
                    newIndex,
                    movedAnnotation,
                    parent: "???",   // TODO  get from own model
                    oldIndex: -1,   // TODO  get from own model
                    replacedAnnotation,
                    replacedDescendants: []   // TODO  get from own model
                })
            }
            case "AddReference": {
                const {parent, reference, index, newTarget, newResolveInfo} = command as AddReferenceCommand // § 6.5.7.1
                return completed<ReferenceAddedEvent>("ReferenceAdded", { // § 6.6.6.1
                    parent,
                    reference,
                    index,
                    newTarget,
                    newResolveInfo
                })
            }
            case "DeleteReference": {
                const {parent, reference, index, deletedTarget, deletedResolveInfo} = command as DeleteReferenceCommand // § 6.5.7.2
                return completed<ReferenceDeletedEvent>("ReferenceDeleted", { // § 6.6.6.2
                    parent,
                    reference,
                    index,
                    deletedTarget,
                    deletedResolveInfo
                })
            }
            case "ChangeReference": {
                const {parent, reference, index, newTarget, newResolveInfo, oldTarget, oldResolveInfo} = command as ChangeReferenceCommand // § 6.5.7.3
                return completed<ReferenceChangedEvent>("ReferenceChanged", { // § 6.6.6.3
                    parent,
                    reference,
                    index,
                    newTarget,
                    newResolveInfo,
                    oldTarget,
                    oldResolveInfo
                })
            }
            case "MoveEntryFromOtherReference": {
                const {newParent, newReference, newIndex, movedTarget} = command as MoveEntryFromOtherReferenceCommand // § 6.5.7.4
                return completed<EntryMovedFromOtherReferenceEvent>("EntryMovedFromOtherReference", { // 6.6.6.4
                    newParent,
                    newReference,
                    newIndex,
                    oldParent: "???",   // TODO  get from own model
                    oldReference: { language: "???", version: "???", key: "???" }, // TODO  get from own model
                    oldIndex: -1,   // TODO  get from own model
                    movedTarget,
                    movedResolveInfo: null   // TODO  get from own model
                })
            }
            case "MoveEntryFromOtherReferenceInSameParent": {
                const {parent, newReference, newIndex, movedTarget} = command as MoveEntryFromOtherReferenceInSameParentCommand // § 6.5.7.5
                return completed<EntryMovedFromOtherReferenceInSameParentEvent>("EntryMovedFromOtherReferenceInSameParent", { // § 6.6.6.5
                    parent,
                    newReference,
                    newIndex,
                    oldReference: { language: "???", version: "???", key: "???" }, // TODO  get from own model
                    oldIndex: -1,   // TODO  get from own model
                    movedTarget,
                    movedResolveInfo: null
                })
            }
            case "MoveEntryInSameReference": {
                const {parent, reference, newIndex, movedTarget} = command as MoveEntryInSameReferenceCommand // § 6.5.7.6
                return completed<EntryMovedInSameReferenceEvent>("EntryMovedInSameReference", { // § 6.6.6.6
                    parent,
                    reference,
                    oldIndex: -1,
                    newIndex,
                    movedTarget,
                    movedResolveInfo: null
                })
            }
            case "MoveAndReplaceEntryFromOtherReference": {
                const {newParent, newReference, newIndex, movedTarget, replacedTarget} = command as MoveAndReplaceEntryFromOtherReferenceCommand // § 6.5.7.7
                return completed<EntryMovedAndReplacedFromOtherReferenceEvent>("EntryMovedAndReplacedFromOtherReference", { // § 6.6.6.7
                    newParent,
                    newReference,
                    newIndex,
                    movedTarget,
                    movedResolveInfo: null,
                    oldParent: "???",   // TODO  get from own model
                    oldReference: { language: "???", version: "???", key: "???" }, // TODO  get from own model
                    oldIndex: -1,   // TODO  get from own model
                    replacedTarget,
                    replacedResolveInfo: null
                })
            }
            case "MoveAndReplaceEntryFromOtherReferenceInSameParent": {
                const {parent, newReference, newIndex, movedTarget} = command as MoveAndReplaceEntryFromOtherReferenceInSameParentCommand // § 6.5.7.8
                return completed<EntryMovedAndReplacedFromOtherReferenceInSameParentEvent>("EntryMovedAndReplacedFromOtherReferenceInSameParent", { // § 6.6.6.8
                    parent,
                    newReference,
                    newIndex,
                    movedTarget,
                    movedResolveInfo: null,
                    oldReference: { language: "???", version: "???", key: "???" }, // TODO  get from own model
                    oldIndex: -1,   // TODO  get from own model
                    replacedTarget: "???",   // TODO  get from own model
                    replacedResolveInfo: null
                })
            }
            case "MoveAndReplaceEntryInSameReference": {
                const {parent, reference, newIndex, movedTarget, oldIndex, replacedTarget} = command as MoveAndReplaceEntryInSameReferenceCommand // § 6.5.7.9
                return completed<EntryMovedAndReplacedInSameReferenceEvent>("EntryMovedAndReplacedInSameReference", { // § 6.6.6.9
                    parent,
                    reference,
                    newIndex,
                    movedTarget,
                    movedResolveInfo: null,
                    oldIndex,
                    replacedTarget,
                    replacedResolveInfo: null
                })
            }
            case "AddReferenceResolveInfo": {
                const {parent, reference, index, newResolveInfo} = command as AddReferenceResolveInfoCommand // § 6.5.7.10
                return completed<ReferenceResolveInfoAddedEvent>("ReferenceResolveInfoAdded", { // § 6.6.6.10
                    parent,
                    reference,
                    index,
                    newResolveInfo,
                    target: "???"   // TODO  get from own model
                })
            }
            case "DeleteReferenceResolveInfo": {
                const {parent, reference, index, deletedResolveInfo} = command as DeleteReferenceResolveInfoCommand // § 6.5.7.11
                return completed<ReferenceResolveInfoDeletedEvent>("ReferenceResolveInfoDeleted", { // § 6.6.6.11
                    parent,
                    reference,
                    index,
                    deletedResolveInfo,
                    target: "???"   // TODO  get from own model
                })
            }
            case "ChangeReferenceResolveInfo": {
                const {parent, reference, index, oldResolveInfo, newResolveInfo} = command as ChangeReferenceResolveInfoCommand // § 6.5.7.12
                return completed<ReferenceResolveInfoChangedEvent>("ReferenceResolveInfoChanged", { // § 6.6.6.12
                    parent,
                    reference,
                    index,
                    newResolveInfo,
                    oldResolveInfo,
                    target: "???"   // TODO  get from own model
                })
            }
            case "AddReferenceTarget": {
                const {parent, reference, index, newTarget} = command as AddReferenceTargetCommand // § 6.5.7.13
                return completed<ReferenceTargetAddedEvent>("ReferenceTargetAdded", { // § 6.6.6.13
                    parent,
                    reference,
                    index,
                    newTarget,
                    resolveInfo: "???"   // TODO  get from own model
                })
            }
            case "DeleteReferenceTarget": {
                const {parent, reference, index, deletedTarget} = command as DeleteReferenceTargetCommand // § 6.5.7.14
                return completed<ReferenceTargetDeletedEvent>("ReferenceTargetDeleted", { // § 6.6.6.14
                    parent,
                    reference,
                    index,
                    resolveInfo: "???",   // TODO  get from own model
                    deletedTarget
                })
            }
            case "ChangeReferenceTarget": {
                const {parent, reference, index, newTarget} = command as ChangeReferenceTargetCommand // § 6.5.7.15
                return completed<ReferenceTargetChangedEvent>("ReferenceTargetChanged", { // § 6.6.6.15
                    parent,
                    reference,
                    index,
                    newTarget,
                    resolveInfo: "???",   // TODO  get from own model
                    replacedTarget: "???"   // TODO  get from own model
                })
            }
            case "CompositeCommand": {
                const {parts} = command as CompositeCommand // § 6.5.8.1
                return completed<CompositeEvent>("CompositeEvent", { // § 6.6.7.1
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

