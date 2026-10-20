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

import { expect } from "chai"

import { MessageRelatedClientState } from "@lionweb/delta-protocol-client"
import { ClientItemLogger, Event, NoOpEvent, semanticNoOpLogger } from "@lionweb/delta-protocol-common"


describe("message-related client state", () => {

    const newSimpleTestState = () =>
        new MessageRelatedClientState((_) => {}, new ClientItemLogger("client-1", semanticNoOpLogger))

    it("handles sign in and sign off correctly", () => {
        const state = newSimpleTestState()

        expect(state.signedOn).to.equal(false)
        expect(state.participationId).to.equal(undefined)

        state.signOnWith("participation-A")

        expect(state.signedOn).to.equal(true)
        expect(state.participationId).to.equal("participation-A")

        state.signOff()

        expect(state.signedOn).to.equal(false)
        expect(state.participationId).to.equal(undefined)
    })

    it("updates the lastReceivedSequenceNumber", () => {
        const state = newSimpleTestState()

        const noOpEvent = (sequenceNumber: number): NoOpEvent => ({
            messageKind: "NoOpEvent",
            sequenceNumber,
            originCommands: [],
            additionalInfos: []
        })
        state.receiveMessageOnClient(noOpEvent(1))
        expect(state.lastReceivedSequenceNumber).to.equal(1)

        state.receiveMessageOnClient(noOpEvent(3))
        expect(state.lastReceivedSequenceNumber).to.equal(1)

        state.receiveMessageOnClient(noOpEvent(2))
        expect(state.lastReceivedSequenceNumber).to.equal(3)
    })

    it("doesn’t process an event it issued itself", () => {
        const eventsToProcess: Event[] = []
        const state = new MessageRelatedClientState(
            (event) => {
                eventsToProcess.push(event)
            },
            new ClientItemLogger("client-1", semanticNoOpLogger)
        )

        const participationA = "participation-A"
        state.signOnWith(participationA)

        const commandId = "cmd-alpha"
        state.registerIssuedCommandId(commandId)

        const event1: NoOpEvent = {
            messageKind: "NoOpEvent",
            sequenceNumber: 1,
            originCommands: [
                {
                    commandId: commandId,
                    participationId: participationA
                }
            ],
            additionalInfos: []
        }
        state.receiveMessageOnClient(event1)
        expect(eventsToProcess).to.deep.equal([])

        const event2: NoOpEvent = {
            messageKind: "NoOpEvent",
            sequenceNumber: 2,
            originCommands: [
                {
                    commandId: commandId,
                    participationId: "participation-B"
                }
            ],
            additionalInfos: []
        }
        state.receiveMessageOnClient(event2)
        expect(eventsToProcess).to.deep.equal([event2])
    })

    it("processes events without being signed on", () => {
        const eventsToProcess: Event[] = []
        const state = new MessageRelatedClientState(
            (event) => {
                eventsToProcess.push(event)
            },
            new ClientItemLogger("client-1", semanticNoOpLogger)
        )

        const event: NoOpEvent = {
            messageKind: "NoOpEvent",
            sequenceNumber: 1,
            originCommands: [],
            additionalInfos: []
        }
        state.receiveMessageOnClient(event)
        expect(eventsToProcess).to.deep.equal([event])
    })

})

