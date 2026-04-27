// Copyright 2026 TRUMPF Laser SE and other contributors
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
// SPDX-FileCopyrightText: 2026 TRUMPF Laser SE and other contributors
// SPDX-License-Identifier: Apache-2.0

import {
    ContinuedChunkMessage,
    Event,
    isChunkedEvent,
    maybeChunkPropertyForSplittableEvent,
    Message,
    SplittableMessage
} from "@lionweb/delta-protocol-common"
import { LionWebJsonChunk, LionWebJsonDeltaChunk } from "@lionweb/json"


/**
 * Instances of this class keep track of a *split message*.
 * (See § 3.7.1 of the specification of the delta protocol.)
 * Its state is updated through its {@link maybeCompletedMessage} method.
 */
export class ChunkedInfo {

    /**
     * The received chunks, indexed by their `continuedChunkSequenceNumber`.
     */
    private readonly chunks: LionWebJsonDeltaChunk[] = []
    /**
     * The number of unique received chunks.
     * Note can be different from `chunks.length` because of `undefined` entries and (theoretically) doubly-received chunks.
     */
    private numberOfReceivedChunks: number = 0
    /**
     * The sequence number of the continued chunked marked with `continuedChunkCompleted === true`,
     * or `-Infinity` initially, so this.numberOfReceivedChunks !== this.lastChunkSequenceNumber + 1,
     * and chunk is not deemed complete already.
     */
    private lastChunkSequenceNumber: number = -Infinity

    constructor(
        /**
         * The initial part of the chunked message.
         * It will be returned from {@link completedMessage} in a modified state.
         */
        private readonly initialMessage: Message,
        /**
         * The property(’s name) of the `initialMessage` containing a {@link LionWebJsonChunk} that may be continued.
         */
        private readonly chunkProperty: string
    ) {
    }

    /**
     * Updates this {@link ChunkInfo} with the given {@link ContinuedChunkMessage}, and
     * @returns the completed message if the chunking is complete,
     * or `undefined` if it isn’t.
     */
    maybeCompletedMessage(message: ContinuedChunkMessage): (Message | undefined) {
        const { chunk, continuedChunkCompleted, continuedChunkSequenceNumber } = message
        if (this.numberOfReceivedChunks === this.lastChunkSequenceNumber + 1) {
            throw new Error(`split message already completed`)
        }
        if (continuedChunkCompleted) {
            if (this.lastChunkSequenceNumber === -Infinity) {
                this.lastChunkSequenceNumber = continuedChunkSequenceNumber
            } else {
                throw new Error(`continued chunk sequence declared complete more than once`)
            }
        }
        if (this.chunks[continuedChunkSequenceNumber] === undefined) {
            this.chunks[continuedChunkSequenceNumber] = chunk
            this.numberOfReceivedChunks++
        } else {
            throw new Error(`received continued chunk with sequence number ${continuedChunkSequenceNumber} more than once`)
        }
        if (this.numberOfReceivedChunks !== this.lastChunkSequenceNumber + 1) {
            return undefined
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mergedChunk = (this.initialMessage as any)[this.chunkProperty] as LionWebJsonChunk
        this.chunks.forEach((continuedChunk) => {
            mergedChunk.nodes.push(...continuedChunk.nodes)
        })
        return this.initialMessage
    }

}


/**
 * An instance of this class can be used to keep track of events that may be split.
 * (See § 5.8.1 of the specification of the delta protocol.)
 * Its state is updated through its {@link handleEvent} method.
 */
export class EventChunker {

    chunkedInfoBySequenceNumber: { [sequenceNumber: number]: ChunkedInfo } = {}

    constructor(
        private readonly acceptCompletedEvent: (completedEvent: Event) => void
    ) {
    }

    handleEvent(event: Event) {
        if (isChunkedEvent(event)) {
            if (!(event.chunkedEventSequenceNumber in this.chunkedInfoBySequenceNumber)) {
                throw new Error(`no (initial) split event with ID ${event.chunkedEventSequenceNumber} known`)
            }
            const chunkedInfo = this.chunkedInfoBySequenceNumber[event.chunkedEventSequenceNumber]
            const maybeCompletedEvent = chunkedInfo.maybeCompletedMessage(event)
            if (maybeCompletedEvent !== undefined) {
                this.acceptCompletedEvent(maybeCompletedEvent as Event)
            }
            return
        }
        const chunkProperty = maybeChunkPropertyForSplittableEvent(event)
        if (chunkProperty !== undefined && (event as SplittableMessage).split) {
            if (event.sequenceNumber in this.chunkedInfoBySequenceNumber) {
                throw new Error(`sequence number ${event.sequenceNumber} already associated with an earlier split event`)
            }
            this.chunkedInfoBySequenceNumber[event.sequenceNumber] = new ChunkedInfo(event, chunkProperty)
            return
        }
        this.acceptCompletedEvent(event)
    }

}

