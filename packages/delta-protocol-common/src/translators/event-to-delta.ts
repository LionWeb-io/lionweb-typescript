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
    IDelta,
    IdMapping,
    IdOrNull,
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
    ReferenceDeletedDelta,
    RootsWithIdMapping
} from "@lionweb/class-core"
import { featureResolversFor, LionWebVersions, PropertyValueDeserializer, referenceToSet } from "@lionweb/core"
import { LionWebJsonChunk } from "@lionweb/json"
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
    Event,
    PartitionAddedEvent,
    PartitionDeletedEvent,
    PropertyAddedEvent,
    PropertyChangedEvent,
    PropertyDeletedEvent,
    ReferenceAddedEvent,
    ReferenceChangedEvent,
    ReferenceDeletedEvent
} from "../payload/index.js"

/**
 * Type def. for a function that translates {@link Event events} to their corresponding {@link IDelta deltas},
 * or {@code undefined} in case no equivalent delta exists for a given event.
 */
export type EventToDeltaTranslator = (event: Event, idMapping: IdMapping) => IDelta | undefined

/**
 * @return a {@link EventToDeltaTranslator} for the languages given as {@link ILanguageBase language bases},
 * with the given {@link IdMapping `idMapping`} and {@link Deserializer `deserializeWithIdMapping` deserializer function}.
 */
export const eventToDeltaTranslator = (
    languageBases: ILanguageBase[],
    deserializeWithIdMapping: Deserializer<RootsWithIdMapping>,
    propertyValueDeserializer: PropertyValueDeserializer = LionWebVersions.v2023_1.builtinsFacade.propertyValueDeserializer
): EventToDeltaTranslator => {

    const eventAsDelta = (event: Event, idMapping: IdMapping): IDelta | undefined => {

        const deserializedNodeFrom = (chunk: LionWebJsonChunk): INodeBase => {
            const { roots, idMapping: newIdMapping } = deserializeWithIdMapping(chunk, idMapping)    // (deserializer should take care of installing delta receiver)
            if (roots.length !== 1) {
                throw new Error(`expected exactly 1 root node in deserialization of chunk in event, but got ${roots.length}`)
            }
            idMapping.mergeIn(newIdMapping)
            return roots[0]
        }
        const { resolvedPropertyFrom, resolvedContainmentFrom, resolvedReferenceFrom } = featureResolversFor(languageBases.map(({language}) => language));
        const resolvedRefTo = (ref: IdOrNull | undefined) =>
            (ref === undefined || ref === null) ? referenceToSet() : idMapping.fromId(ref)

        switch (event.messageKind) {
            /*
             * Note: `messageKind` is a property of the `Message` type,
             * which is an interface and not a sum type,
             * so the switching on it is *not* type-safe,
             * and you don't get any assist (completion, exhaustive-check) on the message kind.
             */

            // in order of the specification (§ 6.6):

            case "PartitionAdded": { // § 6.6.1.1
                const { newPartition } = event as PartitionAddedEvent
                return new PartitionAddedDelta(deserializedNodeFrom(newPartition))
            }
            case "PartitionDeleted": { // § 6.6.1.2
                const { deletedPartition } = event as PartitionDeletedEvent
                return new PartitionDeletedDelta(idMapping.fromId(deletedPartition))
            }
            case "ClassifierChanged": { // § 6.6.2.1
                return undefined
            }
            case "PropertyAdded": { // § 6.6.3.1
                const { node, property, newValue } = event as PropertyAddedEvent
                const resolvedNode = idMapping.fromId(node)
                const resolvedProperty = resolvedPropertyFrom(property, resolvedNode.classifier)
                return new PropertyAddedDelta(resolvedNode, resolvedProperty, propertyValueDeserializer.deserializeValue(newValue, resolvedProperty))
            }
            case "PropertyDeleted": { // § 6.6.3.2
                const { node, property, oldValue } = event as PropertyDeletedEvent
                const resolvedNode = idMapping.fromId(node)
                const resolvedProperty = resolvedPropertyFrom(property, resolvedNode.classifier)
                return new PropertyDeletedDelta(resolvedNode, resolvedProperty, propertyValueDeserializer.deserializeValue(oldValue, resolvedProperty))
            }
            case "PropertyChanged": { // § 6.6.3.3
                const { node, property, newValue, oldValue } = event as PropertyChangedEvent
                const resolvedNode = idMapping.fromId(node)
                const resolvedProperty = resolvedPropertyFrom(property, resolvedNode.classifier)
                return new PropertyChangedDelta(resolvedNode, resolvedProperty, propertyValueDeserializer.deserializeValue(oldValue, resolvedProperty), propertyValueDeserializer.deserializeValue(newValue, resolvedProperty))
            }
            case "ChildAdded": { // § 6.6.4.1
                const { parent, newChild, containment, index } = event as ChildAddedEvent
                const resolvedNode = idMapping.fromId(parent)
                const resolvedContainment = resolvedContainmentFrom(containment, resolvedNode.classifier)
                return new ChildAddedDelta(resolvedNode, resolvedContainment, index, deserializedNodeFrom(newChild))
            }
            case "ChildDeleted": { // § 6.6.4.2
                const { parent, deletedChild, containment, index } = event as ChildDeletedEvent
                const resolvedNode = idMapping.fromId(parent)
                const resolvedContainment = resolvedContainmentFrom(containment, resolvedNode.classifier)
                const resolvedDeletedChild = idMapping.fromId(deletedChild)
                return new ChildDeletedDelta(resolvedNode, resolvedContainment, index, resolvedDeletedChild)
            }
            case "ChildReplaced": { // § 6.6.4.3
                const { newChild, replacedChild, parent, containment, index } = event as ChildReplacedEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedContainment = resolvedContainmentFrom(containment, resolvedParent.classifier)
                const resolvedReplacedChild = idMapping.fromId(replacedChild)
                return new ChildReplacedDelta(resolvedParent, resolvedContainment, index, resolvedReplacedChild, deserializedNodeFrom(newChild))
            }
            case "ChildMovedFromOtherContainment": { // § 6.6.4.4
                const { newParent, newContainment, newIndex, movedChild, oldParent, oldContainment, oldIndex } = event as ChildMovedFromOtherContainmentEvent
                const resolvedOldParent = idMapping.fromId(oldParent)
                const resolvedOldContainment = resolvedContainmentFrom(oldContainment, resolvedOldParent.classifier)
                const resolvedNewParent = idMapping.fromId(newParent)
                const resolvedNewContainment = resolvedContainmentFrom(newContainment, resolvedOldParent.classifier)
                const resolvedMovedChild = idMapping.fromId(movedChild)
                return new ChildMovedFromOtherContainmentDelta(resolvedOldParent, resolvedOldContainment, oldIndex, resolvedNewParent, resolvedNewContainment, newIndex, resolvedMovedChild)
            }
            case "ChildMovedFromOtherContainmentInSameParent": { // § 6.6.4.5
                const { parent, oldContainment, oldIndex, newContainment, newIndex, movedChild } = event as ChildMovedFromOtherContainmentInSameParentEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedOldContainment = resolvedContainmentFrom(oldContainment, resolvedParent.classifier)
                const resolvedNewContainment = resolvedContainmentFrom(newContainment, resolvedParent.classifier)
                const resolvedMovedChild = idMapping.fromId(movedChild)
                return new ChildMovedFromOtherContainmentInSameParentDelta(resolvedParent, resolvedOldContainment, oldIndex, resolvedMovedChild, resolvedNewContainment, newIndex)
            }
            case "ChildMovedInSameContainment": { // § 6.6.4.6
                const { parent, containment, oldIndex, newIndex, movedChild } = event as ChildMovedInSameContainmentEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedContainment = resolvedContainmentFrom(containment, resolvedParent.classifier)
                const resolvedMovedChild = idMapping.fromId(movedChild)
                return new ChildMovedInSameContainmentDelta(resolvedParent, resolvedContainment, oldIndex, newIndex, resolvedMovedChild)
            }
            case "ChildMovedAndReplacedFromOtherContainment": { // § 6.6.4.7
                const { newParent, newContainment, newIndex, movedChild, oldParent, oldContainment, oldIndex, replacedChild } = event as ChildMovedAndReplacedFromOtherContainmentEvent
                const resolvedNewParent = idMapping.fromId(newParent)
                const resolvedNewContainment = resolvedContainmentFrom(newContainment, resolvedNewParent.classifier)
                const resolvedMovedChild = idMapping.fromId(movedChild)
                const resolvedOldParent = idMapping.fromId(oldParent)
                const resolvedOldContainment = resolvedContainmentFrom(oldContainment, resolvedOldParent.classifier)
                const resolvedReplacedChild = idMapping.fromId(replacedChild)
                return new ChildMovedAndReplacedFromOtherContainmentDelta(resolvedNewParent, resolvedNewContainment, newIndex, resolvedMovedChild, resolvedOldParent, resolvedOldContainment, oldIndex, resolvedReplacedChild)
            }
            case "ChildMovedAndReplacedFromOtherContainmentInSameParent": { // § 6.6.4.8
                const { parent, oldContainment, oldIndex, newContainment, newIndex, movedChild, replacedChild } = event as ChildMovedAndReplacedFromOtherContainmentInSameParentEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedOldContainment = resolvedContainmentFrom(oldContainment, resolvedParent.classifier)
                const resolvedNewContainment = resolvedContainmentFrom(newContainment, resolvedParent.classifier)
                const resolvedMovedChild = idMapping.fromId(movedChild)
                const resolvedReplacedChild = idMapping.fromId(replacedChild)
                return new ChildMovedAndReplacedFromOtherContainmentInSameParentDelta(resolvedParent, resolvedOldContainment, oldIndex, resolvedNewContainment, newIndex, resolvedMovedChild, resolvedReplacedChild)
            }
            case "ChildMovedAndReplacedInSameContainment": { // § 6.6.4.9
                const { parent, containment, oldIndex, newIndex, movedChild, replacedChild } = event as ChildMovedAndReplacedInSameContainmentEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedContainment = resolvedContainmentFrom(containment, resolvedParent.classifier)
                const resolvedMovedChild = idMapping.fromId(movedChild)
                const resolvedReplacedChild = idMapping.fromId(replacedChild)
                return new ChildMovedAndReplacedInSameContainmentDelta(resolvedParent, resolvedContainment, oldIndex, newIndex, resolvedMovedChild, resolvedReplacedChild)
            }
            case "AnnotationAdded": { // § 6.6.5.1
                const { parent, index, newAnnotation } = event as AnnotationAddedEvent
                const resolvedParent = idMapping.fromId(parent)
                return new AnnotationAddedDelta(resolvedParent, index, deserializedNodeFrom(newAnnotation))
            }
            case "AnnotationDeleted": { // § 6.6.5.2
                const { parent, index, deletedAnnotation } = event as AnnotationDeletedEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedDeletedAnnotation = idMapping.fromId(deletedAnnotation)
                return new AnnotationDeletedDelta(resolvedParent, index, resolvedDeletedAnnotation)
            }
            case "AnnotationReplaced": { // § 6.6.5.3
                const { newAnnotation, replacedAnnotation, parent, index } = event as AnnotationReplacedEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedReplacedAnnotation = idMapping.fromId(replacedAnnotation)
                return new AnnotationReplacedDelta(resolvedParent, index, resolvedReplacedAnnotation, deserializedNodeFrom(newAnnotation))
            }
            case "AnnotationMovedFromOtherParent": { // § 6.6.5.4
                const { oldParent, oldIndex, newParent, newIndex, movedAnnotation } = event as AnnotationMovedFromOtherParentEvent
                const resolvedOldParent = idMapping.fromId(oldParent)
                const resolvedNewParent = idMapping.fromId(newParent)
                const resolvedMovedAnnotation = idMapping.fromId(movedAnnotation)
                return new AnnotationMovedFromOtherParentDelta(resolvedOldParent, oldIndex, resolvedNewParent, newIndex, resolvedMovedAnnotation)
            }
            case "AnnotationMovedInSameParent": { // § 6.6.5.5
                const { parent, oldIndex, newIndex, movedAnnotation } = event as AnnotationMovedInSameParentEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedMovedAnnotation = idMapping.fromId(movedAnnotation)
                return new AnnotationMovedInSameParentDelta(resolvedParent, oldIndex, newIndex, resolvedMovedAnnotation)
            }
            case "AnnotationMovedAndReplacedFromOtherParent": { // § 6.6.5.6
                const { oldParent, oldIndex, replacedAnnotation, newParent, newIndex, movedAnnotation } = event as AnnotationMovedAndReplacedFromOtherParentEvent
                const resolvedOldParent = idMapping.fromId(oldParent)
                const resolvedReplacedAnnotation = idMapping.fromId(replacedAnnotation)
                const resolvedNewParent = idMapping.fromId(newParent)
                const resolvedMovedAnnotation = idMapping.fromId(movedAnnotation)
                return new AnnotationMovedAndReplacedFromOtherParentDelta(resolvedOldParent, oldIndex, resolvedReplacedAnnotation, resolvedNewParent, newIndex, resolvedMovedAnnotation)
            }
            case "AnnotationMovedAndReplacedInSameParent": { // § 6.6.5.7
                const { parent, oldIndex, newIndex, replacedAnnotation, movedAnnotation } = event as AnnotationMovedAndReplacedInSameParentEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedReplacedAnnotation = idMapping.fromId(replacedAnnotation)
                const resolvedMovedAnnotation = idMapping.fromId(movedAnnotation)
                return new AnnotationMovedAndReplacedInSameParentDelta(resolvedParent, oldIndex, newIndex, resolvedReplacedAnnotation, resolvedMovedAnnotation)
            }
            case "ReferenceAdded": { // § 6.6.6.1
                const { parent, reference, index, newTarget } = event as ReferenceAddedEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedReference = resolvedReferenceFrom(reference, resolvedParent.classifier)
                const resolvedNewTarget = resolvedRefTo(newTarget)
                return new ReferenceAddedDelta(resolvedParent, resolvedReference, index, resolvedNewTarget)
            }
            case "ReferenceDeleted": { // § 6.6.6.2
                const { parent, reference, index, deletedTarget } = event as ReferenceDeletedEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedReference = resolvedReferenceFrom(reference, resolvedParent.classifier)
                const resolvedDeletedTarget = resolvedRefTo(deletedTarget)
                return new ReferenceDeletedDelta(resolvedParent, resolvedReference, index, resolvedDeletedTarget)
            }
            case "ReferenceChanged": { // § 6.6.6.3
                const { parent, reference, index, oldTarget, newTarget } = event as ReferenceChangedEvent
                const resolvedParent = idMapping.fromId(parent)
                const resolvedReference = resolvedReferenceFrom(reference, resolvedParent.classifier)
                const resolvedOldTarget = resolvedRefTo(oldTarget)
                const resolvedNewTarget = resolvedRefTo(newTarget)
                return new ReferenceChangedDelta(resolvedParent, resolvedReference, index, resolvedNewTarget, resolvedOldTarget)
            }
            case "CompositeEvent": { // § 6.6.7.1
                const { parts } = event as CompositeEvent
                return new CompositeDelta(
                    parts
                        .map((part) => eventAsDelta(part, idMapping))
                        .filter((deltaOrUndefined) => deltaOrUndefined !== undefined) as IDelta[]
                )
            }
            case "NoOp": { // § 6.6.7.2
                return new NoOpDelta()
            }
            case "ErrorEvent": { // § 6.6.7.3
                return undefined
            }

            default:
                throw new Error(`can't handle event of kind ${event.messageKind}`)
        }
    }

    return eventAsDelta
}

