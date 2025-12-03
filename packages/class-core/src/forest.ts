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

import { isPartition } from "@lionweb/core"
import { LionWebJsonChunk } from "@lionweb/json"
import { action, makeObservable, observable } from "mobx"

import { FactoryConfiguration, ILanguageBase, INodeBase, NodeBaseFactory } from "./base-types.js"
import {
    applyDeltaWithLookup,
    DeltaReceiver,
    IDelta,
    PartitionAddedDelta,
    PartitionDeletedDelta,
    updateIdMappingWithDelta
} from "./deltas/index.js"
import {
    Deserializer,
    DeserializerConfiguration,
    nodeBaseDeserializerWithIdMapping,
    RootsWithIdMapping
} from "./deserializer.js"
import { combinedFactoryFor } from "./factory.js"
import { IdMapping } from "./id-mapping.js"


/**
 * An instance of this class encompasses a complete model (=“forest”), to conveniently encapsulate that.
 * (Essentially, it’s a sort of in-memory repository.)
 */
export class Forest {

    private readonly languageBases: ILanguageBase[]

    private readonly receiveDelta?: DeltaReceiver

    /**
     * The partitions contained in `this` forest.
     */
    readonly partitions: INodeBase[]

    /**
     * The {@link IdMapping ID mapping} mapping to all nodes in any of the partitions in `this` forest from the IDs of those nodes **plus** *unattached* nodes.
     * A node is attached if it’s a partition – i.e., its classifier is marked as a partition –, or if it’s – directly, or indirectly – contained by a partition.
     * This may happen as a result of deleting nodes, or of unattached nodes being deserialized into `this` forest through the `deserializeInto` or `applyDelta[s]` methods.
     */
    readonly idMapping: IdMapping   // We need to expose this to be able to instantiate an EventToDeltaTranslator!

    /**
     * A {@link NodeBaseFactory factory} for nodes with classifiers from the {@link ILanguageBase language bases} passed during instantiation of `this` forest.
     * This factory method installs the {@link DeltaReceiver} that may be passed during instantiation of `this` forest.
     */
    readonly createNode: NodeBaseFactory

    /**
     * A {@link Deserializer deserializer} that returns roots/partitions together with an ID mapping for all nodes in those.
     * *Note*: this is primarily for internal use — specifically: to create an event-to-delta translator with.
     * (That translator uses type from `delta-protocol-common` so we don’t want to have it here.)
     * Using this method does *not* change `this` forest’s state.
     */
    readonly deserializeWithIdMapping: Deserializer<RootsWithIdMapping>


    constructor(configuration: FactoryConfiguration & DeserializerConfiguration) {
        this.languageBases = configuration.languageBases
        this.receiveDelta = configuration.receiveDelta
        this.partitions = []
        this.idMapping = new IdMapping({})
        this.createNode = combinedFactoryFor(this.languageBases, this.receiveDelta)
        this.deserializeWithIdMapping = nodeBaseDeserializerWithIdMapping(configuration)
    }


    private emitDelta = (thunk: () => IDelta) => {
        if (this.receiveDelta) {
            this.receiveDelta(thunk())
        }
    }

    /**
     * Adds the given `partition` to the partitions of `this` forest – provided it’s not already part of it –,
     * and emits the corresponding {@link PartitionAddedDelta}.
     */
    addPartition = (partition: INodeBase) => {
        if (!isPartition(partition.classifier)) {
            throw new Error(`node with ID ${partition.id} is a ${partition.classifier.name} which is not a <<partition>> concept`)
        }
        if (this.partitions.indexOf(partition) === -1) {
            this.partitions.push(partition)
            this.idMapping.updateWith(partition)
            this.emitDelta(() => new PartitionAddedDelta(partition))
        } // else: ignore; already done
    }

    /**
     * Deletes the indicated `partition` from the partitions of `this` forest – provided it’s part of it –,
     * and emits the corresponding {@link PartitionDeletedDelta}.
     */
    deletePartition = (partition: INodeBase) => {
        const index = this.partitions.indexOf(partition)
        if (index > -1) {
            this.partitions.splice(index, 1)
            this.emitDelta(() => new PartitionDeletedDelta(partition))
        } else {
            throw new Error(`node with id "${partition.id}" is not an added partition`)
        }
    }

    /**
     * Deserializes the given `serializationChunk` and adds any partitions in it to the partitions of `this` forest,
     * It also updates the ID mapping, including with mappings for deserialized unattached nodes.
     */
    deserializeInto = (serializationChunk: LionWebJsonChunk): INodeBase[] => {
        const { roots: newRoots, idMapping: newIdMapping } = this.deserializeWithIdMapping(serializationChunk, this.idMapping)
        this.partitions.push(...newRoots.filter((newRoot) => isPartition(newRoot.classifier)))
        this.idMapping.mergeIn(newIdMapping)    // also merge in new unattached, non-partition roots
        return newRoots
    }

    /**
     * Applies the given `delta`, taking care of updating the state of the internal ID mapping.
     */
    applyDelta = (delta: IDelta) => {
        applyDeltaWithLookup(this.idMapping, delta, () => this.partitions)
        updateIdMappingWithDelta(this.idMapping, delta)
    }

    /**
     * Applies the given `deltas`, taking care of updating the state of the internal ID mapping.
     */
    applyDeltas = (deltas: IDelta[]) => {
        deltas.forEach((delta) => this.applyDelta(delta))
    }

}


/**
 * “Mobx-ified” version of the {@link Forest} class.
 */
export class ObservableForest extends Forest {

    constructor(configuration: FactoryConfiguration & DeserializerConfiguration) {
        super(configuration)
        makeObservable(
            this,
            {
                partitions: observable,
                addPartition: action,
                deserializeInto: action,
                applyDelta: action,
                applyDeltas: action
            }
        )
    }

}
// (but also see: https://mobx.js.org/subclassing.html)

