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
    Deserializer,
    EntryMovedAndReplacedFromOtherReferenceDelta,
    EntryMovedAndReplacedFromOtherReferenceInSameParentDelta,
    EntryMovedAndReplacedInSameReferenceDelta,
    EntryMovedFromOtherReferenceDelta,
    EntryMovedFromOtherReferenceInSameParentDelta,
    EntryMovedInSameReferenceDelta,
    IDelta,
    IdMapping,
    ILanguageBase,
    INodeBase,
    NoOpDelta,
    PartitionAddedDelta,
    PartitionDeletedDelta,
    PropertyAddedDelta,
    PropertyChangedDelta,
    PropertyDeletedDelta,
    ReferenceAddedDelta,
    ReferenceChangedDelta,
    ReferenceDeletedDelta
} from "@lionweb/class-core"
import { Containment, MemoisingSymbolTable, Property, Reference, unresolved } from "@lionweb/core"
import { LionWebId, LionWebJsonChunk, LionWebJsonMetaPointer } from "@lionweb/json"
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
    PartitionAddedEvent,
    PartitionDeletedEvent,
    PropertyAddedEvent,
    PropertyChangedEvent,
    PropertyDeletedEvent,
    ReferenceAddedEvent,
    ReferenceChangedEvent,
    ReferenceDeletedEvent
} from "../payload/event-types.js"

/**
 * Type def. for a function that translates {@link Event events} to their corresponding {@link IDelta deltas},
 * or {@code undefined} in case no equivalent delta exists for a given event.
 */
export type EventToDeltaTranslator = (event: Event) => IDelta | undefined

/**
 * @return a {@link EventToDeltaTranslator} for the languages given as {@link ILanguageBase language bases},
 * with the given {@link IdMapping `idMapping`} and {@link Deserializer `deserialized` deserializer function}.
 */
export const eventToDeltaTranslator = (languageBases: ILanguageBase[], idMapping: IdMapping, deserialized: Deserializer<INodeBase[]>): EventToDeltaTranslator => {
    const symbolTable = new MemoisingSymbolTable(languageBases.map(({language}) => language))
    const deserializedNodeFrom = (chunk: LionWebJsonChunk): INodeBase =>
        deserialized(chunk)[0]
    const resolvedPropertyFrom = (metaPointer: LionWebJsonMetaPointer, container: INodeBase): Property =>
        symbolTable.featureMatching(container.classifier.metaPointer(), metaPointer) as Property
    const resolvedContainmentFrom = (metaPointer: LionWebJsonMetaPointer, container: INodeBase): Containment =>
        symbolTable.featureMatching(container.classifier.metaPointer(), metaPointer) as Containment
    const resolvedReferenceFrom = (metaPointer: LionWebJsonMetaPointer, container: INodeBase): Reference =>
        symbolTable.featureMatching(container.classifier.metaPointer(), metaPointer) as Reference
    const resolvedRefTo = (ref: LionWebId | null) =>
        ref === null ? unresolved : idMapping.fromId(ref)

    const eventAsDelta = (event: Event): IDelta | undefined => {
        switch (event.messageKind) {

            // in order of the specification (§ 6.6):

            case "PartitionAdded": { // § 6.6.1.1
                const {newPartition} = event as PartitionAddedEvent
                return new PartitionAddedDelta(deserializedNodeFrom(newPartition))
            }
            case "PartitionDeleted": { // § 6.6.1.2
                const {deletedPartition} = event as PartitionDeletedEvent
                return new PartitionDeletedDelta(idMapping.fromId(deletedPartition))
            }
            case "ClassifierChanged": { // § 6.6.2.1
                return undefined
            }
            case "PropertyAdded": { // § 6.6.3.1
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const {node, property, newValue} = event as PropertyAddedEvent<any>
                const resolvedNode = idMapping.fromId(node)
                const resolvedProperty = resolvedPropertyFrom(property, resolvedNode)
                return new PropertyAddedDelta(resolvedNode, resolvedProperty, newValue)
            }
            case "PropertyDeleted": { // § 6.6.3.2
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const {node, property, oldValue} = event as PropertyDeletedEvent<any>
                const resolvedNode = idMapping.fromId(node)
                const resolvedProperty = resolvedPropertyFrom(property, resolvedNode)
                return new PropertyDeletedDelta(resolvedNode, resolvedProperty, oldValue)
            }
            case "PropertyChanged": { // § 6.6.3.3
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const {node, property, newValue, oldValue} = event as PropertyChangedEvent<any>
                const resolvedNode = idMapping.fromId(node)
                const resolvedProperty = resolvedPropertyFrom(property, resolvedNode)
                return new PropertyChangedDelta(resolvedNode, resolvedProperty, oldValue, newValue)
            }
            case "ChildAdded": { // § 6.6.4.1
                const {parent, newChild, containment, index} = event as ChildAddedEvent
                const resolvedNode = idMapping.fromId(parent)
                const resolvedContainment = resolvedContainmentFrom(containment, resolvedNode)
                return new ChildAddedDelta(resolvedNode, resolvedContainment, index, deserialized(newChild)[0])
            }
            case "ChildDeleted": { // § 6.6.4.2
                const {parent, deletedChild, containment, index} = event as ChildDeletedEvent
                const resolvedNode = idMapping.fromId(parent)
                const resolvedContainment = resolvedContainmentFrom(containment, resolvedNode)
                const resolvedDeletedChild = idMapping.fromId(deletedChild)
                return new ChildDeletedDelta(resolvedNode, resolvedContainment, index, resolvedDeletedChild)
            }
            case "ChildReplaced": { // § 6.6.4.3
                const {newChild, replacedChild, parent, containment, index} = event as ChildReplacedEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedContainment = resolvedContainmentFrom(containment, resolvedParent)
                const resolvedReplacedChild = idMapping.fromId(replacedChild)
                return new ChildReplacedDelta(resolvedParent, resolvedContainment, index, resolvedReplacedChild, deserialized(newChild)[0])
            }
            case "ChildMovedFromOtherContainment": { // § 6.6.4.4
                const {newParent, newContainment, newIndex, movedChild, oldParent, oldContainment, oldIndex} = event as ChildMovedFromOtherContainmentEvent
                const resolvedOldParent = idMapping.fromId(oldParent)
                const resolvedOldContainment = resolvedContainmentFrom(oldContainment, resolvedOldParent)
                const resolvedNewParent = idMapping.fromId(newParent)
                const resolvedNewContainment = resolvedContainmentFrom(newContainment, resolvedOldParent)
                const resolvedMovedChild = idMapping.fromId(movedChild)
                return new ChildMovedFromOtherContainmentDelta(resolvedOldParent, resolvedOldContainment, oldIndex, resolvedNewParent, resolvedNewContainment, newIndex, resolvedMovedChild)
            }
            case "ChildMovedFromOtherContainmentInSameParent": { // § 6.6.4.5
                const {parent, oldContainment, oldIndex, newContainment, newIndex, movedChild} = event as ChildMovedFromOtherContainmentInSameParentEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedOldContainment = resolvedContainmentFrom(oldContainment, resolvedParent)
                const resolvedNewContainment = resolvedContainmentFrom(newContainment, resolvedParent)
                const resolvedMovedChild = idMapping.fromId(movedChild)
                return new ChildMovedFromOtherContainmentInSameParentDelta(resolvedParent, resolvedOldContainment, oldIndex, resolvedMovedChild, resolvedNewContainment, newIndex)
            }
            case "ChildMovedInSameContainment": { // § 6.6.4.6
                const {parent, containment, oldIndex, newIndex, movedChild} = event as ChildMovedInSameContainmentEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedContainment = resolvedContainmentFrom(containment, resolvedParent)
                const resolvedMovedChild = idMapping.fromId(movedChild)
                return new ChildMovedInSameContainmentDelta(resolvedParent, resolvedContainment, oldIndex, newIndex, resolvedMovedChild)
            }
            case "ChildMovedAndReplacedFromOtherContainment": { // § 6.6.4.7
                const {newParent, newContainment, newIndex, movedChild, oldParent, oldContainment, oldIndex, replacedChild} = event as ChildMovedAndReplacedFromOtherContainmentEvent
                const resolvedNewParent = idMapping.fromId(newParent)
                const resolvedNewContainment = resolvedContainmentFrom(newContainment, resolvedNewParent)
                const resolvedMovedChild = idMapping.fromId(movedChild)
                const resolvedOldParent = idMapping.fromId(oldParent)
                const resolvedOldContainment = resolvedContainmentFrom(oldContainment, resolvedOldParent)
                const resolvedReplacedChild = idMapping.fromId(replacedChild)
                return new ChildMovedAndReplacedFromOtherContainmentDelta(resolvedNewParent, resolvedNewContainment, newIndex, resolvedMovedChild, resolvedOldParent, resolvedOldContainment, oldIndex, resolvedReplacedChild)
            }
            case "ChildMovedAndReplacedFromOtherContainmentInSameParent": { // § 6.6.4.8
                const {parent, oldContainment, oldIndex, newContainment, newIndex, movedChild, replacedChild} = event as ChildMovedAndReplacedFromOtherContainmentInSameParentEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedOldContainment = resolvedContainmentFrom(oldContainment, resolvedParent)
                const resolvedNewContainment = resolvedContainmentFrom(newContainment, resolvedParent)
                const resolvedMovedChild = idMapping.fromId(movedChild)
                const resolvedReplacedChild = idMapping.fromId(replacedChild)
                return new ChildMovedAndReplacedFromOtherContainmentInSameParentDelta(resolvedParent, resolvedOldContainment, oldIndex, resolvedNewContainment, newIndex, resolvedMovedChild, resolvedReplacedChild)
            }
            case "ChildMovedAndReplacedInSameContainment": { // § 6.6.4.9
                const {parent, containment, oldIndex, newIndex, movedChild, replacedChild} = event as ChildMovedAndReplacedInSameContainmentEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedContainment = resolvedContainmentFrom(containment, resolvedParent)
                const resolvedMovedChild = idMapping.fromId(movedChild)
                const resolvedReplacedChild = idMapping.fromId(replacedChild)
                return new ChildMovedAndReplacedInSameContainmentDelta(resolvedParent, resolvedContainment, oldIndex, newIndex, resolvedMovedChild, resolvedReplacedChild)
            }
            case "AnnotationAdded": { // § 6.6.5.1
                const {parent, index, newAnnotation} = event as AnnotationAddedEvent
                const resolvedParent = idMapping.fromId(parent)
                return new AnnotationAddedDelta(resolvedParent, index, deserialized(newAnnotation)[0])
            }
            case "AnnotationDeleted": { // § 6.6.5.2
                const {parent, index, deletedAnnotation} = event as AnnotationDeletedEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedDeletedAnnotation = idMapping.fromId(deletedAnnotation)
                return new AnnotationDeletedDelta(resolvedParent, index, resolvedDeletedAnnotation)
            }
            case "AnnotationReplaced": { // § 6.6.5.3
                const {newAnnotation, replacedAnnotation, parent, index} = event as AnnotationReplacedEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedReplacedAnnotation = idMapping.fromId(replacedAnnotation)
                return new AnnotationReplacedDelta(resolvedParent, index, resolvedReplacedAnnotation, deserialized(newAnnotation)[0])
            }
            case "AnnotationMovedFromOtherParent": { // § 6.6.5.4
                const {oldParent, oldIndex, newParent, newIndex, movedAnnotation} = event as AnnotationMovedFromOtherParentEvent
                const resolvedOldParent = idMapping.fromId(oldParent)
                const resolvedNewParent = idMapping.fromId(newParent)
                const resolvedMovedAnnotation = idMapping.fromId(movedAnnotation)
                return new AnnotationMovedFromOtherParentDelta(resolvedOldParent, oldIndex, resolvedNewParent, newIndex, resolvedMovedAnnotation)
            }
            case "AnnotationMovedInSameParent": { // § 6.6.5.5
                const {parent, oldIndex, newIndex, movedAnnotation} = event as AnnotationMovedInSameParentEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedMovedAnnotation = idMapping.fromId(movedAnnotation)
                return new AnnotationMovedInSameParentDelta(resolvedParent, oldIndex, newIndex, resolvedMovedAnnotation)
            }
            case "AnnotationMovedAndReplacedFromOtherParent": { // § 6.6.5.6
                const {oldParent, oldIndex, replacedAnnotation, newParent, newIndex, movedAnnotation} = event as AnnotationMovedAndReplacedFromOtherParentEvent
                const resolvedOldParent = idMapping.fromId(oldParent)
                const resolvedReplacedAnnotation = idMapping.fromId(replacedAnnotation)
                const resolvedNewParent = idMapping.fromId(newParent)
                const resolvedMovedAnnotation = idMapping.fromId(movedAnnotation)
                return new AnnotationMovedAndReplacedFromOtherParentDelta(resolvedOldParent, oldIndex, resolvedReplacedAnnotation, resolvedNewParent, newIndex, resolvedMovedAnnotation)
            }
            case "AnnotationMovedAndReplacedInSameParent": { // § 6.6.5.7
                const {parent, oldIndex, newIndex, replacedAnnotation, movedAnnotation} = event as AnnotationMovedAndReplacedInSameParentEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedReplacedAnnotation = idMapping.fromId(replacedAnnotation)
                const resolvedMovedAnnotation = idMapping.fromId(movedAnnotation)
                return new AnnotationMovedAndReplacedInSameParentDelta(resolvedParent, oldIndex, newIndex, resolvedReplacedAnnotation, resolvedMovedAnnotation)
            }
            case "ReferenceAdded": { // § 6.6.6.1
                const {parent, reference, index, newTarget} = event as ReferenceAddedEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedReference = resolvedReferenceFrom(reference, resolvedParent)
                const resolvedNewTarget = resolvedRefTo(newTarget)
                return new ReferenceAddedDelta(resolvedParent, resolvedReference, index, resolvedNewTarget)
            }
            case "ReferenceDeleted": { // § 6.6.6.2
                const {parent, reference, index, deletedTarget} = event as ReferenceDeletedEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedReference = resolvedReferenceFrom(reference, resolvedParent)
                const resolvedDeletedTarget = resolvedRefTo(deletedTarget)
                return new ReferenceDeletedDelta(resolvedParent, resolvedReference, index, resolvedDeletedTarget)
            }
            case "ReferenceChanged": { // § 6.6.6.3
                const {parent, reference, index, oldTarget, newTarget} = event as ReferenceChangedEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedReference = resolvedReferenceFrom(reference, resolvedParent)
                const resolvedOldTarget = resolvedRefTo(oldTarget)
                const resolvedNewTarget = resolvedRefTo(newTarget)
                return new ReferenceChangedDelta(resolvedParent, resolvedReference, index, resolvedNewTarget, resolvedOldTarget)
            }
            case "EntryMovedFromOtherReference": { // § 6.6.6.4
                const {newParent, newReference, newIndex, oldParent, oldReference, oldIndex, movedTarget} = event as EntryMovedFromOtherReferenceEvent
                const resolvedNewParent = idMapping.fromId(newParent)
                const resolvedNewReference = resolvedReferenceFrom(newReference, resolvedNewParent)
                const resolvedOldParent = idMapping.fromId(oldParent)
                const resolvedOldReference = resolvedReferenceFrom(oldReference, resolvedOldParent)
                const resolvedMovedTarget = resolvedRefTo(movedTarget)
                return new EntryMovedFromOtherReferenceDelta(resolvedOldParent, resolvedOldReference, oldIndex, resolvedNewParent, resolvedNewReference, newIndex, resolvedMovedTarget)
            }
            case "EntryMovedFromOtherReferenceInSameParent": { // § 6.6.6.5
                const {parent, oldReference, oldIndex, newReference, newIndex, movedTarget} = event as EntryMovedFromOtherReferenceInSameParentEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedOldReference = resolvedReferenceFrom(oldReference, resolvedParent)
                const resolvedNewReference = resolvedReferenceFrom(newReference, resolvedParent)
                const resolvedMovedTarget = resolvedRefTo(movedTarget)
                return new EntryMovedFromOtherReferenceInSameParentDelta(resolvedParent, resolvedOldReference, oldIndex, resolvedNewReference, newIndex, resolvedMovedTarget)
            }
            case "EntryMovedInSameReference": { // § 6.6.6.6
                const {parent, reference, oldIndex, newIndex, movedTarget} = event as EntryMovedInSameReferenceEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedReference = resolvedReferenceFrom(reference, resolvedParent)
                const resolvedMovedTarget = resolvedRefTo(movedTarget)
                return new EntryMovedInSameReferenceDelta(resolvedParent, resolvedReference, oldIndex, newIndex, resolvedMovedTarget)
            }
            case "EntryMovedAndReplacedFromOtherReference": { // § 6.6.6.7
                const {newParent, newReference, newIndex, movedTarget, oldParent, oldReference, oldIndex, replacedTarget} = event as EntryMovedAndReplacedFromOtherReferenceEvent
                const resolvedNewParent = idMapping.fromId(newParent)
                const resolvedNewReference = resolvedReferenceFrom(newReference, resolvedNewParent)
                const resolvedMovedTarget = resolvedRefTo(movedTarget)
                const resolvedOldParent = idMapping.fromId(oldParent)
                const resolvedOldReference = resolvedReferenceFrom(oldReference, resolvedOldParent)
                const resolvedReplacedTarget = resolvedRefTo(replacedTarget)
                return new EntryMovedAndReplacedFromOtherReferenceDelta(resolvedNewParent, resolvedNewReference, newIndex, resolvedMovedTarget, resolvedOldParent, resolvedOldReference, oldIndex, resolvedReplacedTarget)
            }
            case "EntryMovedAndReplacedFromOtherReferenceInSameParent": { // § 6.6.6.8
                const {parent, oldReference, oldIndex, newReference, newIndex, movedTarget, replacedTarget} = event as EntryMovedAndReplacedFromOtherReferenceInSameParentEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedOldReference = resolvedReferenceFrom(oldReference, resolvedParent)
                const resolvedNewReference = resolvedReferenceFrom(newReference, resolvedParent)
                const resolvedMovedTarget = resolvedRefTo(movedTarget)
                const resolvedReplacedTarget= resolvedRefTo(replacedTarget)
                return new EntryMovedAndReplacedFromOtherReferenceInSameParentDelta(resolvedParent, resolvedOldReference, oldIndex, resolvedNewReference, newIndex, resolvedMovedTarget, resolvedReplacedTarget)
            }
            case "EntryMovedAndReplacedInSameReference": { // § 6.6.6.9
                const {parent, reference, oldIndex, newIndex, movedTarget, replacedTarget} = event as EntryMovedAndReplacedInSameReferenceEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedReference = resolvedReferenceFrom(reference, resolvedParent)
                const resolvedMovedTarget = resolvedRefTo(movedTarget)
                const resolvedReplacedTarget = resolvedRefTo(replacedTarget)
                return new EntryMovedAndReplacedInSameReferenceDelta(resolvedParent, resolvedReference, oldIndex, newIndex, resolvedMovedTarget, resolvedReplacedTarget)
            }
            case "ReferenceResolveInfoAdded": { // § 6.6.6.10
                return undefined
            }
            case "ReferenceResolveInfoDeleted": { // § 6.6.6.11
                return undefined
            }
            case "ReferenceResolveInfoChanged": { // § 6.6.6.12
                return undefined
            }
            case "ReferenceTargetAdded": { // § 6.6.6.13
                return undefined
            }
            case "ReferenceTargetDeleted": { // § 6.6.6.14
                return undefined
            }
            case "ReferenceTargetChanged": { // § 6.6.6.15
                return undefined
            }
            case "CompositeEvent": { // § 6.6.7.1
                const {parts} = event as CompositeEvent
                return new CompositeDelta(
                    parts
                        .map(eventAsDelta)
                        .filter((deltaOrUndefined) => deltaOrUndefined !== undefined) as IDelta[]
                )
            }
            case "NoOp": { // § 6.6.7.2
                return new NoOpDelta()
            }
            case "Error": { // § 6.6.7.3
                return undefined
            }

            default:
                throw new Error(`can't handle event of kind ${event.messageKind}`)
        }
    }

    return eventAsDelta
}

