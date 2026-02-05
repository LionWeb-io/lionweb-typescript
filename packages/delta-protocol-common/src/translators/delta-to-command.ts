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
    IDelta,
    idFrom,
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
import { LionWebVersions, metaPointerFor, PropertyValueSerializer } from "@lionweb/core"
import { LionWebId } from "@lionweb/json"
import {
    AddAnnotationCommand,
    AddChildCommand,
    AddPartitionCommand,
    AddPropertyCommand,
    AddReferenceCommand,
    ChangePropertyCommand,
    ChangeReferenceCommand,
    Command,
    CompositeCommand,
    DeleteAnnotationCommand,
    DeleteChildCommand,
    DeletePartitionCommand,
    DeletePropertyCommand,
    DeleteReferenceCommand,
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
    ReplaceAnnotationCommand,
    ReplaceChildCommand
} from "../payload/index.js"


/**
 * Type def. for functions that translate {@link IDelta deltas} into {@link Command commands}.
 * A value of `undefined` is returned for a delta that has no command equivalent.
 * If a command is returned, it has the command ID passed.
 */
export type DeltaToCommandTranslator = (delta: IDelta, commandId: LionWebId) => Command | undefined

/**
 * @return a {@link DeltaToCommandTranslator} function instance
 * that translates a given {@link IDelta `delta`} into a {@link Command command} with the given `commandId`.
 * Serialization of primitively-typed values is governed by the given {@link PropertyValueSerializer `primitiveValueSerializer`},
 * which defaults to the {@link builtinPropertyValueSerializer}.
 */
export const deltaToCommandTranslator = (
    primitiveValueSerializer: PropertyValueSerializer = LionWebVersions.v2023_1.builtinsFacade.propertyValueSerializer
) => {
    const propertyValueSerializer = propertyValueSerializerWith({ primitiveValueSerializer })

    const translated: DeltaToCommandTranslator = (delta, commandId) => {
        const completed = <CT extends Command>(
            commandName: CT["messageKind"],
            partialCommand: Omit<CT, "messageKind" | "commandId" | "protocolMessages">
        ) => ({
            messageKind: commandName,
            commandId,
            ...partialCommand,
            protocolMessages: []
        })

        // in order of the specification (§ 6.5):

        if (delta instanceof PartitionAddedDelta) {
            return completed<AddPartitionCommand>("AddPartition", { // § 6.5.2.1
                newPartition: serializeNodeBases([delta.newPartition])
            })
        }
        if (delta instanceof PartitionDeletedDelta) {
            return completed<DeletePartitionCommand>("DeletePartition", { // § 6.5.2.2
                deletedPartition: delta.deletedPartition.id
            })
        }
        if (delta instanceof PropertyAddedDelta) {
            return completed<AddPropertyCommand>("AddProperty", { // § 6.5.4.1
                node: delta.node.id,
                property: metaPointerFor(delta.property),
                newValue: propertyValueSerializer.serializeValue(delta.value, delta.property)!
            })
        }
        if (delta instanceof PropertyDeletedDelta) {
            return completed<DeletePropertyCommand>("DeleteProperty", { // § 6.5.4.2
                node: delta.node.id,
                property: metaPointerFor(delta.property)
            })
        }
        if (delta instanceof PropertyChangedDelta) {
            return completed<ChangePropertyCommand>("ChangeProperty", { // § 6.5.4.3
                node: delta.node.id,
                property: metaPointerFor(delta.property),
                newValue: propertyValueSerializer.serializeValue(delta.newValue, delta.property)!
            })
        }
        if (delta instanceof ChildAddedDelta) {
            return completed<AddChildCommand>("AddChild", { // § 6.5.5.1
                parent: delta.parent.id,
                newChild: serializeNodeBases([delta.newChild]),
                containment: metaPointerFor(delta.containment),
                index: delta.index
            })
        }
        if (delta instanceof ChildDeletedDelta) {
            return completed<DeleteChildCommand>("DeleteChild", { // § 6.5.5.2
                parent: delta.parent.id,
                containment: metaPointerFor(delta.containment),
                index: delta.index,
                deletedChild: delta.deletedChild.id
            })
        }
        if (delta instanceof ChildReplacedDelta) {
            return completed<ReplaceChildCommand>("ReplaceChild", { // § 6.5.5.3
                newChild: serializeNodeBases([delta.newChild]),
                parent: delta.parent.id,
                containment: metaPointerFor(delta.containment),
                index: delta.index,
                replacedChild: delta.replacedChild.id
            })
        }
        if (delta instanceof ChildMovedFromOtherContainmentDelta) {
            return completed<MoveChildFromOtherContainmentCommand>("MoveChildFromOtherContainment", { // § 6.5.5.4
                newParent: delta.newParent.id,
                newContainment: metaPointerFor(delta.newContainment),
                newIndex: delta.newIndex,
                movedChild: delta.movedChild.id
            })
        }
        if (delta instanceof ChildMovedFromOtherContainmentInSameParentDelta) {
            return completed<MoveChildFromOtherContainmentInSameParentCommand>("MoveChildFromOtherContainmentInSameParent", { // § 6.5.5.5
                newContainment: metaPointerFor(delta.newContainment),
                newIndex: delta.newIndex,
                movedChild: delta.movedChild.id,
                parent: delta.parent.id,
                oldContainment: metaPointerFor(delta.oldContainment),
                oldIndex: delta.oldIndex
            })
        }
        if (delta instanceof ChildMovedInSameContainmentDelta) {
            return completed<MoveChildInSameContainmentCommand>("MoveChildInSameContainment", { // § 6.5.5.6
                newIndex: delta.newIndex,
                movedChild: delta.movedChild.id
            })
        }
        if (delta instanceof ChildMovedAndReplacedFromOtherContainmentDelta) {
            return completed<MoveAndReplaceChildFromOtherContainmentCommand>("MoveAndReplaceChildFromOtherContainment", { // § 6.5.5.7
                newParent: delta.newParent.id,
                newContainment: metaPointerFor(delta.newContainment),
                newIndex: delta.newIndex,
                replacedChild: delta.replacedChild.id,
                movedChild: delta.movedChild.id
            })
        }
        if (delta instanceof ChildMovedAndReplacedFromOtherContainmentInSameParentDelta) {
            return completed<MoveAndReplaceChildFromOtherContainmentInSameParentCommand>("MoveAndReplaceChildFromOtherContainmentInSameParent", { // § 6.5.5.8
                newContainment: metaPointerFor(delta.newContainment),
                newIndex: delta.newIndex,
                replacedChild: delta.replacedChild.id,
                movedChild: delta.movedChild.id
            })
        }
        if (delta instanceof ChildMovedAndReplacedInSameContainmentDelta) {
            return completed<MoveAndReplaceChildInSameContainmentCommand>("MoveAndReplaceChildInSameContainment", { // § 6.5.5.9
                newIndex: delta.newIndex,
                replacedChild: delta.replacedChild.id
            })
        }
        if (delta instanceof AnnotationAddedDelta) {
            return completed<AddAnnotationCommand>("AddAnnotation", { // § 6.5.6.1
                parent: delta.parent.id,
                index: delta.index,
                newAnnotation: serializeNodeBases([delta.newAnnotation])
            })
        }
        if (delta instanceof AnnotationDeletedDelta) {
            return completed<DeleteAnnotationCommand>("DeleteAnnotation", { // § 6.5.6.2
                parent: delta.parent.id,
                deletedAnnotation: delta.deletedAnnotation.id,
                index: delta.index
            })
        }
        if (delta instanceof AnnotationReplacedDelta) {
            return completed<ReplaceAnnotationCommand>("ReplaceAnnotation", { // § 6.5.6.3
                newAnnotation: serializeNodeBases([delta.newAnnotation]),
                parent: delta.parent.id,
                index: delta.index,
                replacedAnnotation: delta.replacedAnnotation.id
            })
        }
        if (delta instanceof AnnotationMovedFromOtherParentDelta) {
            return completed<MoveAnnotationFromOtherParentCommand>("MoveAnnotationFromOtherParent", { // § 6.5.6.4
                newParent: delta.newParent.id,
                newIndex: delta.newIndex,
                movedAnnotation: delta.movedAnnotation.id
            })
        }
        if (delta instanceof AnnotationMovedInSameParentDelta) {
            return completed<MoveAnnotationInSameParentCommand>("MoveAnnotationInSameParent", { // § 6.5.6.5
                newIndex: delta.newIndex,
                movedAnnotation: delta.movedAnnotation.id
            })
        }
        if (delta instanceof AnnotationMovedAndReplacedFromOtherParentDelta) {
            return completed<MoveAndReplaceAnnotationFromOtherParentCommand>("MoveAndReplaceAnnotationFromOtherParent", { // § 6.5.6.6
                newParent: delta.newParent.id,
                newIndex: delta.newIndex,
                replacedAnnotation: delta.replacedAnnotation.id,
                movedAnnotation: delta.movedAnnotation.id
            })
        }
        if (delta instanceof AnnotationMovedAndReplacedInSameParentDelta) {
            return completed<MoveAndReplaceAnnotationInSameParentCommand>("MoveAndReplaceAnnotationInSameParent", { // § 6.5.6.7
                newIndex: delta.newIndex,
                replacedAnnotation: delta.replacedAnnotation.id,
                movedAnnotation: delta.movedAnnotation.id
            })
        }
        if (delta instanceof ReferenceAddedDelta) {
            return completed<AddReferenceCommand>("AddReference", { // § 6.5.7.1
                parent: delta.parent.id,
                reference: metaPointerFor(delta.reference),
                index: delta.index,
                newTarget: idFrom(delta.newTarget),
                newResolveInfo: nodeBaseReader.resolveInfoFor!(delta.newTarget!, delta.reference)!
            })
        }
        if (delta instanceof ReferenceDeletedDelta) {
            return completed<DeleteReferenceCommand>("DeleteReference", { // § 6.5.7.2
                parent: delta.parent.id,
                reference: metaPointerFor(delta.reference),
                index: delta.index,
                deletedTarget: idFrom(delta.deletedTarget),
                deletedResolveInfo: nodeBaseReader.resolveInfoFor!(delta.deletedTarget!, delta.reference)!
            })
        }
        if (delta instanceof ReferenceChangedDelta) {
            return completed<ChangeReferenceCommand>("ChangeReference", { // § 6.5.7.3
                parent: delta.parent.id,
                reference: metaPointerFor(delta.reference),
                index: delta.index,
                oldTarget: idFrom(delta.oldTarget),
                oldResolveInfo: nodeBaseReader.resolveInfoFor!(delta.oldTarget!, delta.reference)!,
                newTarget: idFrom(delta.newTarget),
                newResolveInfo: nodeBaseReader.resolveInfoFor!(delta.oldTarget!, delta.reference)!
            })
        }
        if (delta instanceof CompositeDelta) {
            return completed<CompositeCommand>("CompositeCommand", { // § 6.5.8.1
                parts: delta.parts
                    .map((part, index) => translated(part, `${commandId}-${index}`))  // TODO  inject proper ID generator!
                    .filter((command) => command !== undefined) as Command[]
            })
        }
        if (delta instanceof NoOpDelta) {
            return undefined
        }

        throw new Error(`can't handle delta of type ${delta.constructor.name}`)
    }

    return translated
}

