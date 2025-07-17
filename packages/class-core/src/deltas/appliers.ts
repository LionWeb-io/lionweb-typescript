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
    AnnotationMovedFromOtherParentDelta,
    AnnotationMovedInSameParentDelta,
    AnnotationReplacedDelta,
    ChildAddedDelta,
    ChildDeletedDelta,
    ChildMovedDelta,
    ChildMovedInSameContainmentDelta,
    ChildReplacedDelta,
    NoOpDelta,
    PropertyAddedDelta,
    PropertyChangedDelta,
    PropertyDeletedDelta,
    ReferenceAddedDelta,
    ReferenceDeletedDelta,
    ReferenceMovedDelta,
    ReferenceMovedInSameReferenceDelta,
    ReferenceReplacedDelta
} from "./types.g.js"
import {
    MultiContainmentValueManager,
    MultiReferenceValueManager,
    SingleContainmentValueManager,
    SingleReferenceValueManager
} from "../value-managers/index.js"
import { INodeBase } from "../base-types.js"
import { IdMapping } from "../id-mapping.js"
import { SingleRef, unresolved } from "@lionweb/core"
import { IDelta } from "./base.js"


/**
 * @return a function that applies a given {@link Delta}, given an optional {@link IdMapping ID mapping}.
 * If an {@link IdMapping} is provided, the {@link INodeBase nodes} relevant for the delta are looked up from that;
 * otherwise, the delta is applied directly to (object-)referenced nodes.
 *
 * This is an internal function, solely meant to DRY the delta application with and without lookup in
 */
const deltaApplier = (idMapping?: IdMapping) =>
    (delta: IDelta): void => {

        const lookupNodeFrom = (node: INodeBase) => {
            if (idMapping === undefined) {
                return node
            }
            const lookup = idMapping.fromId(node.id);
            if (lookup === undefined) {
                throw new Error(`look up of node with id=${node.id} failed: node doesn't exist in ID mapping`);
            }
            if (node.classifier !== lookup.classifier) {
                throw new Error(`look up of node with id=${node.id} failed: looked-up node has a different classifier than the original one`);
            }
            return lookup;
        };

        const lookupNodeRefFrom = <T extends INodeBase>(nodeRef: SingleRef<T>): SingleRef<T> => {
            if (idMapping === undefined) {
                return nodeRef
            }
            return nodeRef === unresolved
                ? unresolved
                : lookupNodeFrom(nodeRef) as SingleRef<T>
        }

        if (delta instanceof NoOpDelta) {
            return;
        }

        if (delta instanceof PropertyAddedDelta) {
            lookupNodeFrom(delta.container).getPropertyValueManager(delta.property).setDirectly(delta.value);
            return;
        }
        if (delta instanceof PropertyChangedDelta) {
            lookupNodeFrom(delta.container).getPropertyValueManager(delta.property).setDirectly(delta.newValue);
            return;
        }
        if (delta instanceof PropertyDeletedDelta) {
            lookupNodeFrom(delta.container).getPropertyValueManager(delta.property).setDirectly(undefined);
            return;
        }

        if (delta instanceof ChildAddedDelta) {
            const valueManager = lookupNodeFrom(delta.parent).getContainmentValueManager(delta.containment);
            const newChild = lookupNodeFrom(delta.newChild);
            if (delta.containment.multiple) {
                (valueManager as MultiContainmentValueManager<INodeBase>).insertAtIndexDirectly(newChild, delta.index);
            } else {
                (valueManager as SingleContainmentValueManager<INodeBase>).setDirectly(newChild);
            }
            newChild.attachTo(delta.parent, delta.containment);
            return;
        }
        if (delta instanceof ChildReplacedDelta) {
            const valueManager = lookupNodeFrom(delta.parent).getContainmentValueManager(delta.containment);
            const replacedChild = lookupNodeFrom(delta.replacedChild);
            const newChild = lookupNodeFrom(delta.newChild);
            if (delta.containment.multiple) {
                const multiValueManager = valueManager as MultiContainmentValueManager<INodeBase>;
                multiValueManager.removeDirectly(replacedChild); // should be at index delta.index
                multiValueManager.insertAtIndexDirectly(newChild, delta.index);
            } else {
                (valueManager as SingleContainmentValueManager<INodeBase>).setDirectly(newChild);
            }
            replacedChild.detach();
            newChild.attachTo(delta.parent, delta.containment);
            return;
        }
        if (delta instanceof ChildMovedDelta) {
            const oldValueManager = delta.oldParent.getContainmentValueManager(delta.oldContainment);
            const child = lookupNodeFrom(delta.child);
            if (delta.oldContainment.multiple) {
                (oldValueManager as MultiContainmentValueManager<INodeBase>).removeDirectly(child); // should be at index delta.oldIndex
            } else {
                (oldValueManager as SingleContainmentValueManager<INodeBase>).setDirectly(undefined);
            }
            const newValueManager = delta.newParent.getContainmentValueManager(delta.newContainment);
            if (delta.newContainment.multiple) {
                (newValueManager as MultiContainmentValueManager<INodeBase>).insertAtIndexDirectly(child, delta.newIndex);
            } else {
                (newValueManager as SingleContainmentValueManager<INodeBase>).setDirectly(child);
            }
            child.detach();
            child.attachTo(delta.newParent, delta.newContainment);
            return;
        }
        if (delta instanceof ChildMovedInSameContainmentDelta) {
            const valueManager = lookupNodeFrom(delta.parent).getContainmentValueManager(delta.containment) as MultiContainmentValueManager<INodeBase>;
            valueManager.moveDirectly(delta.oldIndex, delta.newIndex);
            return;
        }
        if (delta instanceof ChildDeletedDelta) {
            const valueManager = lookupNodeFrom(delta.parent).getContainmentValueManager(delta.containment);
            if (delta.containment.multiple) {
                const multiValueManager = valueManager as MultiContainmentValueManager<INodeBase>;
                multiValueManager.removeDirectly(lookupNodeFrom(delta.deletedChild));
            } else {
                (valueManager as SingleContainmentValueManager<INodeBase>).setDirectly(undefined);
            }
            delta.deletedChild.detach();
            return;
        }

        if (delta instanceof ReferenceAddedDelta) {
            const valueManager = lookupNodeFrom(delta.container).getReferenceValueManager(delta.reference);
            const newTarget = lookupNodeRefFrom(delta.newTarget);
            if (delta.reference.multiple) {
                (valueManager as MultiReferenceValueManager<INodeBase>).insertAtIndexDirectly(newTarget, delta.index);
            } else {
                (valueManager as SingleReferenceValueManager<INodeBase>).setDirectly(newTarget);
            }
            return;
        }
        if (delta instanceof ReferenceReplacedDelta) {
            const valueManager = lookupNodeFrom(delta.container).getReferenceValueManager(delta.reference);
            const replacedTarget = lookupNodeRefFrom(delta.replacedTarget);
            const newTarget = lookupNodeRefFrom(delta.newTarget);
            if (delta.reference.multiple) {
                const multiValueManager = valueManager as MultiReferenceValueManager<INodeBase>;
                multiValueManager.removeDirectly(replacedTarget); // should be at index delta.index
                multiValueManager.insertAtIndexDirectly(newTarget, delta.index);
            } else {
                (valueManager as SingleReferenceValueManager<INodeBase>).setDirectly(newTarget);
            }
            return;
        }
        if (delta instanceof ReferenceMovedDelta) {
            const oldValueManager = lookupNodeFrom(delta.oldContainer).getReferenceValueManager(delta.oldReference);
            const target = lookupNodeRefFrom(delta.target);
            if (delta.oldReference.multiple) {
                (oldValueManager as MultiReferenceValueManager<INodeBase>).removeDirectly(target);  // should be at index delta.oldIndex
            } else {
                (oldValueManager as SingleReferenceValueManager<INodeBase>).setDirectly(undefined);
            }
            const newValueManager = lookupNodeFrom(delta.newContainer).getReferenceValueManager(delta.newReference);
            if (delta.newReference.multiple) {
                (newValueManager as MultiReferenceValueManager<INodeBase>).insertAtIndexDirectly(target, delta.newIndex);
            } else {
                (newValueManager as SingleReferenceValueManager<INodeBase>).setDirectly(target);
            }
            return;
        }
        if (delta instanceof ReferenceMovedInSameReferenceDelta) {
            const valueManager = lookupNodeFrom(delta.container).getReferenceValueManager(delta.reference) as MultiReferenceValueManager<INodeBase>;
            valueManager.moveDirectly(delta.oldIndex, delta.newIndex);
            return;
        }
        if (delta instanceof ReferenceDeletedDelta) {
            const valueManager = lookupNodeFrom(delta.container).getReferenceValueManager(delta.reference);
            const deletedTarget = lookupNodeRefFrom(delta.deletedTarget);
            if (delta.reference.multiple) {
                const multiValueManager = valueManager as MultiReferenceValueManager<INodeBase>;
                multiValueManager.removeDirectly(deletedTarget);
            } else {
                (valueManager as SingleReferenceValueManager<INodeBase>).setDirectly(undefined);
            }
            return;
        }

        if (delta instanceof AnnotationAddedDelta) {
            lookupNodeFrom(delta.parent).annotationsValueManager.insertAtIndexDirectly(delta.newAnnotation, delta.index);
            delta.newAnnotation.attachTo(delta.parent, null);
            return;
        }
        if (delta instanceof AnnotationDeletedDelta) {
            lookupNodeFrom(delta.parent).annotationsValueManager.removeDirectly(delta.deletedAnnotation);    // should be at index delta.index
            delta.deletedAnnotation.detach();
            return;
        }
        if (delta instanceof AnnotationReplacedDelta) {
            const valueManager = lookupNodeFrom(delta.parent).annotationsValueManager;
            valueManager.removeDirectly(delta.replacedAnnotation);  // should be at index delta.index
            delta.replacedAnnotation.detach();
            valueManager.insertAtIndexDirectly(delta.newAnnotation, delta.index);
            delta.newAnnotation.attachTo(delta.parent, null);
            return;
        }
        if (delta instanceof AnnotationMovedFromOtherParentDelta) {
            lookupNodeFrom(delta.oldParent).annotationsValueManager.removeDirectly(delta.movedAnnotation);  // should be at index delta.index
            delta.movedAnnotation.detach();
            lookupNodeFrom(delta.newParent).annotationsValueManager.insertAtIndexDirectly(delta.movedAnnotation, delta.newIndex);
            delta.movedAnnotation.attachTo(delta.newParent, null);
            return;
        }
        if (delta instanceof AnnotationMovedInSameParentDelta) {
            const valueManager = lookupNodeFrom(delta.parent).annotationsValueManager;
            valueManager.moveDirectly(delta.oldIndex, delta.newIndex);
            return;
        }

        throw new Error(`application of delta of class ${delta.constructor.name} not implemented`);

    };


/**
 * Applies the given {@link Delta deltas} to the {@link INodeBase nodes} (object-)referenced in the deltas.
 */
export const applyDeltas = (deltas: IDelta[]): void => {
    deltas.forEach(applyDelta);
};


/**
 * Applies the given {@link Delta delta} to the {@link INodeBase nodes} (object-)referenced in the delta.
 */
export const applyDelta = deltaApplier()


/**
 * Applies the given {@link Delta deltas} to {@link INodeBase nodes} given as the values of a {@link IdMapping ID mapping id &rarr; node}.
 * Note that the deltas are *not* applied to the original nodes (object-)referenced by the deltas, but to the nodes present in the ID mapping.
 * These can be distinct from the original nodes, e.g. after a roundtrip to an external model processor.
 *
 * @usage should look as follows.
 *
 * ```typescript
 * const {roots, idMapping} = deserializeAsLDMModelWithMapping(serializationChunk, handleDelta);
 * applyDeltasWithLookup(idMapping, deltas);
 * ```
 */
export const applyDeltasWithLookup = (idMapping: IdMapping, deltas: IDelta[]): void => {
    deltas.forEach((delta) => applyDeltaWithLookup(idMapping, delta));
};


/**
 * Applies the given {@link Delta delta} to {@link nodes INodeBase} given as the values of a {@link IdMapping ID mapping id &rarr; node}.
 * Note that the delta is *not* applied to the original nodes (object-)referenced by the deltas, but to the nodes present in the ID mapping.
 * These can be distinct from the original nodes, e.g. after a roundtrip to an external model processor. *
 * @usage should look as follows.
 *
 * ```typescript
 * const {roots, idMapping} = deserializeAsLDMModelWithMapping(serializationChunk, handleDelta);
 * applyDeltaWithLookup(idMapping, delta);
 * ```
 */
export const applyDeltaWithLookup = (idMapping: IdMapping, delta: IDelta): void =>
    deltaApplier(idMapping)(delta)


/**
 * Updates the given {@link IdMapping ID mapping} with the given {@link IDelta delta}.
 * This is important if the delta adds a newly-created node to the model.
 * (This function is here to avoid that {@link IdMapping} needs to know about {@link IDelta delta types}.)
 */
export const updateIdMappingWithDelta = (idMapping: IdMapping, delta: IDelta) => {
    if (delta instanceof ChildAddedDelta) {
        idMapping.updateWith(delta.newChild);
    }
    if (delta instanceof ChildReplacedDelta) {
        idMapping.updateWith(delta.newChild);
    }
    if (delta instanceof AnnotationAddedDelta) {
        idMapping.updateWith(delta.newAnnotation);
    }
    // (nothing to be done: no need –yet?- to take deleted child nodes out of the ID mapping)
};

