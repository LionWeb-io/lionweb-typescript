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
    allNodesFrom,
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
    IDelta,
    idFrom,
    INodeBase,
    nodeBaseReader,
    NoOpDelta,
    PartitionAddedDelta,
    PartitionDeletedDelta,
    PropertyAddedDelta,
    PropertyChangedDelta,
    PropertyDeletedDelta,
    propertyValueSerializerWith,
    ReferenceAddedDelta,
    ReferenceChangedDelta,
    ReferenceDeletedDelta,
    serializeNodeBases
} from "@lionweb/class-core"
import { idOf, LionWebVersions, metaPointerFor, PropertyValueSerializer } from "@lionweb/core"
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
    CommandSource,
    Event,
    NoOpEvent,
    PartitionAddedEvent,
    PartitionDeletedEvent,
    PropertyAddedEvent,
    PropertyChangedEvent,
    PropertyDeletedEvent,
    ProtocolMessage,
    ReferenceAddedEvent,
    ReferenceChangedEvent,
    ReferenceDeletedEvent
} from "../payload/index.js"


const allIdsOfDescendantsFrom = (node: INodeBase) =>
    allNodesFrom(node).slice(1).map(idOf)


/**
 * Type def. for functions that translate {@link IDelta deltas} into {@link Event events},
 * taking care of proper sequence numbers and (implicitly) serialization of property values.
 *
 * More precisely, such a function returns a pair consisting of an {@link Event event}
 * and the last-used sequence number, where the event is the translation of the given {@link IDelta delta}.
 * Sequence numbers start from the given `lastUsedSequenceNumber`.
 */
export type DeltaToEventTranslator = (
    delta: IDelta,
    lastUsedSequenceNumber: number
) => [event: Event, lastUsedSequenceNumber: number]


/**
 * A type def. for functions that compute the `originCommands` part of the event corresponding to the given {@link IDelta delta}.
 */
export type OriginCommandsGenerator = (delta: IDelta) => CommandSource[]

/**
 * A type def. for functions that compute the `protocolMessages` part of the event corresponding to the given {@link IDelta delta},
 * with the given sequence number.
 */
export type ProtocolMessagesGenerator = (delta: IDelta, sequenceNumber: number) => ProtocolMessage[]

/**
 * A type def. for the configuration of a {@link DeltaToEventTranslator}.
 */
export type DeltaToEventTranslatorConfiguration = Partial<{
    /**
     * A {@link PropertyValueSerializer} that's *only* used to serialize *primitive* values.
     * Defaults to the `lioncoreBuiltinsFacade.propertyValueSerializer`.
     */
    primitiveValueSerializer: PropertyValueSerializer,
    /**
     * A {@link OriginCommandsGenerator} — defaults to producing `[]`.
     */
    originCommandsGenerator: OriginCommandsGenerator,
    /**
     * A {@link ProtocolMessagesGenerator} — defaults to producing `[]`.
     */
    protocolMessagesGenerator: ProtocolMessagesGenerator
}>


/**
 * @return a {@link DeltaToEventTranslator} instance using the given {@link DeltaToEventTranslatorConfiguration}.
 */
export const deltaToEventTranslator = (
    { primitiveValueSerializer, originCommandsGenerator, protocolMessagesGenerator }: DeltaToEventTranslatorConfiguration
): DeltaToEventTranslator => {
    const propertyValueSerializer = primitiveValueSerializer === undefined
        ? LionWebVersions.v2023_1.builtinsFacade.propertyValueSerializer
        : propertyValueSerializerWith({ primitiveValueSerializer })
    return (delta, lastUsedSequenceNumber) => {

        let sequenceNumber = lastUsedSequenceNumber
        const completed = <ET extends Event>(
            technicalName: ET["messageKind"],
            partialEvent: Omit<ET, "messageKind" | "sequenceNumber" | "originCommands" | "protocolMessages">
        ) => ({
            messageKind: technicalName,
            ...partialEvent,
            sequenceNumber: ++sequenceNumber,
                // (translated -> completed can be called recursively ==> need to do increment as late as possible)
            originCommands: originCommandsGenerator === undefined ? [] : originCommandsGenerator(delta),
            protocolMessages: protocolMessagesGenerator === undefined ? [] : protocolMessagesGenerator(delta, sequenceNumber)
        })

        // in order of the specification (§ 6.6):

        const translated = (delta: IDelta): Event => {
            if (delta instanceof PartitionAddedDelta) {
                return completed<PartitionAddedEvent>("PartitionAdded", { // § 6.6.1.1
                    newPartition: serializeNodeBases([delta.newPartition])
                })
            }
            if (delta instanceof PartitionDeletedDelta) {
                return completed<PartitionDeletedEvent>("PartitionDeleted", { // § 6.6.1.2
                    deletedPartition: delta.deletedPartition.id
                })
            }
            if (delta instanceof PropertyAddedDelta) {
                return completed<PropertyAddedEvent>("PropertyAdded", { // § 6.6.3.1
                    node: delta.node.id,
                    property: metaPointerFor(delta.property),
                    newValue: propertyValueSerializer.serializeValue(delta.value, delta.property)!
                })
            }
            if (delta instanceof PropertyDeletedDelta) {
                return completed<PropertyDeletedEvent>("PropertyDeleted", { // § 6.6.3.2
                    node: delta.node.id,
                    property: metaPointerFor(delta.property),
                    oldValue: propertyValueSerializer.serializeValue(delta.oldValue, delta.property)!
                })
            }
            if (delta instanceof PropertyChangedDelta) {
                return completed<PropertyChangedEvent>("PropertyChanged", { // § 6.6.3.3
                    node: delta.node.id,
                    property: metaPointerFor(delta.property),
                    newValue: propertyValueSerializer.serializeValue(delta.newValue, delta.property)!,
                    oldValue: propertyValueSerializer.serializeValue(delta.oldValue, delta.property)!
                })
            }
            if (delta instanceof ChildAddedDelta) {
                return completed<ChildAddedEvent>("ChildAdded", { // § 6.6.4.1
                    parent: delta.parent.id,
                    newChild: serializeNodeBases([delta.newChild]),
                    containment: metaPointerFor(delta.containment),
                    index: delta.index
                })
            }
            if (delta instanceof ChildDeletedDelta) {
                return completed<ChildDeletedEvent>("ChildDeleted", { // § 6.6.4.2
                    parent: delta.parent.id,
                    containment: metaPointerFor(delta.containment),
                    index: delta.index,
                    deletedChild: delta.deletedChild.id,
                    deletedDescendants: allIdsOfDescendantsFrom(delta.deletedChild)
                })
            }
            if (delta instanceof ChildReplacedDelta) {
                return completed<ChildReplacedEvent>("ChildReplaced", { // § 6.6.4.3
                    newChild: serializeNodeBases([delta.newChild]),
                    parent: delta.parent.id,
                    containment: metaPointerFor(delta.containment),
                    index: delta.index,
                    replacedChild: delta.replacedChild.id,
                    replacedDescendants: allIdsOfDescendantsFrom(delta.replacedChild)
                })
            }
            if (delta instanceof ChildMovedFromOtherContainmentDelta) {
                return completed<ChildMovedFromOtherContainmentEvent>("ChildMovedFromOtherContainment", { // § 6.6.4.4
                    newParent: delta.newParent.id,
                    newContainment: metaPointerFor(delta.newContainment),
                    newIndex: delta.newIndex,
                    movedChild: delta.movedChild.id,
                    oldParent: delta.oldParent.id,
                    oldContainment: metaPointerFor(delta.oldContainment),
                    oldIndex: delta.oldIndex
                })
            }
            if (delta instanceof ChildMovedFromOtherContainmentInSameParentDelta) {
                return completed<ChildMovedFromOtherContainmentInSameParentEvent>("ChildMovedFromOtherContainmentInSameParent", { // § 6.6.4.5
                    newContainment: metaPointerFor(delta.newContainment),
                    newIndex: delta.newIndex,
                    movedChild: delta.movedChild.id,
                    parent: delta.parent.id,
                    oldContainment: metaPointerFor(delta.oldContainment),
                    oldIndex: delta.oldIndex
                })
            }
            if (delta instanceof ChildMovedInSameContainmentDelta) {
                return completed<ChildMovedInSameContainmentEvent>("ChildMovedInSameContainment", { // § 6.6.4.6
                    parent: delta.parent.id,
                    containment: metaPointerFor(delta.containment),
                    oldIndex: delta.oldIndex,
                    newIndex: delta.newIndex,
                    movedChild: delta.movedChild.id
                })
            }
            if (delta instanceof ChildMovedAndReplacedFromOtherContainmentDelta) {
                return completed<ChildMovedAndReplacedFromOtherContainmentEvent>("ChildMovedAndReplacedFromOtherContainment", { // § 6.6.4.7
                    newParent: delta.newParent.id,
                    newContainment: metaPointerFor(delta.newContainment),
                    newIndex: delta.newIndex,
                    oldParent: delta.oldParent.id,
                    oldContainment: metaPointerFor(delta.oldContainment),
                    oldIndex: delta.oldIndex,
                    movedChild: delta.movedChild.id,
                    replacedChild: delta.replacedChild.id,
                    replacedDescendants: allIdsOfDescendantsFrom(delta.replacedChild)
                })
            }
            if (delta instanceof ChildMovedAndReplacedFromOtherContainmentInSameParentDelta) {
                return completed<ChildMovedAndReplacedFromOtherContainmentInSameParentEvent>("ChildMovedAndReplacedFromOtherContainmentInSameParent", { // § 6.6.4.8
                    parent: delta.parent.id,
                    oldContainment: metaPointerFor(delta.oldContainment),
                    oldIndex: delta.oldIndex,
                    newContainment: metaPointerFor(delta.newContainment),
                    newIndex: delta.newIndex,
                    replacedChild: delta.replacedChild.id,
                    replacedDescendants: allIdsOfDescendantsFrom(delta.replacedChild),
                    movedChild: delta.movedChild.id
                })
            }
            if (delta instanceof ChildMovedAndReplacedInSameContainmentDelta) {
                return completed<ChildMovedAndReplacedInSameContainmentEvent>("ChildMovedAndReplacedInSameContainment", { // § 6.6.4.9
                    parent: delta.parent.id,
                    containment: metaPointerFor(delta.containment),
                    oldIndex: delta.oldIndex,
                    newIndex: delta.newIndex,
                    movedChild: delta.movedChild.id,
                    replacedChild: delta.replacedChild.id,
                    replacedDescendants: allIdsOfDescendantsFrom(delta.replacedChild)
                })
            }
            if (delta instanceof AnnotationAddedDelta) {
                return completed<AnnotationAddedEvent>("AnnotationAdded", { // § 6.6.5.1
                    parent: delta.parent.id,
                    index: delta.index,
                    newAnnotation: serializeNodeBases([delta.newAnnotation])
                })
            }
            if (delta instanceof AnnotationDeletedDelta) {
                return completed<AnnotationDeletedEvent>("AnnotationDeleted", { // § 6.6.5.2
                    parent: delta.parent.id,
                    deletedAnnotation: delta.deletedAnnotation.id,
                    index: delta.index,
                    deletedDescendants: allIdsOfDescendantsFrom(delta.deletedAnnotation)
                })
            }
            if (delta instanceof AnnotationReplacedDelta) {
                return completed<AnnotationReplacedEvent>("AnnotationReplaced", { // § 6.6.5.3
                    newAnnotation: serializeNodeBases([delta.newAnnotation]),
                    parent: delta.parent.id,
                    index: delta.index,
                    replacedAnnotation: delta.replacedAnnotation.id,
                    replacedDescendants: allIdsOfDescendantsFrom(delta.replacedAnnotation)
                })
            }
            if (delta instanceof AnnotationMovedFromOtherParentDelta) {
                return completed<AnnotationMovedFromOtherParentEvent>("AnnotationMovedFromOtherParent", { // § 6.6.5.4
                    oldParent: delta.oldParent.id,
                    oldIndex: delta.oldIndex,
                    newParent: delta.newParent.id,
                    newIndex: delta.newIndex,
                    movedAnnotation: delta.movedAnnotation.id
                })
            }
            if (delta instanceof AnnotationMovedInSameParentDelta) {
                return completed<AnnotationMovedInSameParentEvent>("AnnotationMovedInSameParent", { // § 6.6.5.5
                    parent: delta.parent.id,
                    oldIndex: delta.oldIndex,
                    newIndex: delta.newIndex,
                    movedAnnotation: delta.movedAnnotation.id
                })
            }
            if (delta instanceof AnnotationMovedAndReplacedFromOtherParentDelta) {
                return completed<AnnotationMovedAndReplacedFromOtherParentEvent>("AnnotationMovedAndReplacedFromOtherParent", { // § 6.6.5.6
                    oldParent: delta.oldParent.id,
                    oldIndex: delta.oldIndex,
                    newParent: delta.newParent.id,
                    newIndex: delta.newIndex,
                    replacedAnnotation: delta.replacedAnnotation.id,
                    replacedDescendants: allIdsOfDescendantsFrom(delta.replacedAnnotation),
                    movedAnnotation: delta.movedAnnotation.id
                })
            }
            if (delta instanceof AnnotationMovedAndReplacedInSameParentDelta) {
                return completed<AnnotationMovedAndReplacedInSameParentEvent>("AnnotationMovedAndReplacedInSameParent", { // § 6.6.5.7
                    parent: delta.parent.id,
                    oldIndex: delta.oldIndex,
                    newIndex: delta.newIndex,
                    replacedAnnotation: delta.replacedAnnotation.id,
                    replacedDescendants: allIdsOfDescendantsFrom(delta.replacedAnnotation),
                    movedAnnotation: delta.movedAnnotation.id
                })
            }
            if (delta instanceof ReferenceAddedDelta) {
                return completed<ReferenceAddedEvent>("ReferenceAdded", { // § 6.6.6.1
                    parent: delta.parent.id,
                    reference: metaPointerFor(delta.reference),
                    index: delta.index,
                    newReference: idFrom(delta.newReference),
                    newResolveInfo: nodeBaseReader.resolveInfoFor!(delta.newReference!, delta.reference)!
                })
            }
            if (delta instanceof ReferenceDeletedDelta) {
                return completed<ReferenceDeletedEvent>("ReferenceDeleted", { // § 6.6.6.2
                    parent: delta.parent.id,
                    reference: metaPointerFor(delta.reference),
                    index: delta.index,
                    deletedReference: idFrom(delta.deletedReference),
                    deletedResolveInfo: nodeBaseReader.resolveInfoFor!(delta.deletedReference!, delta.reference)!
                })
            }
            if (delta instanceof ReferenceChangedDelta) {
                return completed<ReferenceChangedEvent>("ReferenceChanged", { // § 6.6.6.3
                    parent: delta.parent.id,
                    reference: metaPointerFor(delta.reference),
                    index: delta.index,
                    oldReference: idFrom(delta.oldReference),
                    oldResolveInfo: nodeBaseReader.resolveInfoFor!(delta.oldReference!, delta.reference)!,
                    newReference: idFrom(delta.newReference),
                    newResolveInfo: nodeBaseReader.resolveInfoFor!(delta.newReference!, delta.reference)!
                })
            }
            if (delta instanceof NoOpDelta) {
                return completed<NoOpEvent>("NoOp", {})
            }

            throw new Error(`can't handle delta of type ${delta.constructor.name}`)
        }

        return [translated(delta), sequenceNumber]
    }
}

