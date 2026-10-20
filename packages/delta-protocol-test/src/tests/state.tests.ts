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
import {
    ClientDidNotApplyEventFromOwnCommand,
    ClientIssuedWarning,
    ClientItemLogger,
    Event,
    ISemanticLogItem,
    NoOpEvent,
    semanticLogItemStorer,
    semanticNoOpLogger
} from "@lionweb/delta-protocol-common"


describe.only("message-related client state", () => {

    const clientId = "client-1"

    const newSimpleTestState = () =>
        new MessageRelatedClientState(
            (_) => {},
            new ClientItemLogger(clientId, semanticNoOpLogger)
        )

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



    const newTestFixture = (): [state: MessageRelatedClientState, eventsToProcess: Event[], clientLogItems: ISemanticLogItem[]] => {
        const eventsToProcess: Event[] = []
        const [semanticLogger, semanticLogItems] = semanticLogItemStorer()
        const state = new MessageRelatedClientState(
            (event) => {
                eventsToProcess.push(event)
            },
            new ClientItemLogger(clientId, semanticLogger)
        )
        return [state, eventsToProcess, semanticLogItems]
    }

    it("doesn’t process an event it[’s supposed to have] originated itself", () => {
        const [state, eventsToProcess, clientLogItems] = newTestFixture()

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
        expect(clientLogItems.length).to.equal(2)
        expect(clientLogItems[1] instanceof ClientDidNotApplyEventFromOwnCommand).to.equal(true)
        expect((clientLogItems[1] as ClientDidNotApplyEventFromOwnCommand).originatingCommandId).to.equal(commandId)

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
        expect(clientLogItems.length).to.equal(3)
    })

    it("warns about supposedly self-originating events with unregistered command IDs", () => {
        const [state, _eventsToProcess, clientLogItems] = newTestFixture()

        const participationId = "participation-A"
        state.signOnWith(participationId)
        const commandId = "command-alt-delete"
        state.receiveMessageOnClient({
            messageKind: "NoOpEvent",
            sequenceNumber: 1,
            originCommands: [
                {
                    commandId,
                    participationId
                }
            ],
            additionalInfos: []
        })
        expect(clientLogItems.length).to.equal(2)
        expect(clientLogItems[1] instanceof ClientIssuedWarning).to.equal(true)
        expect((clientLogItems[1] as ClientIssuedWarning).message).to.equal(`received an event stating to have this client as origin (through participation ID "participation-A") without a registration of one or more command IDs ("${commandId}")`)
    })

    it("processes events without being signed on", () => {
        const [state, eventsToProcess, _clientLogItems] = newTestFixture()

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

