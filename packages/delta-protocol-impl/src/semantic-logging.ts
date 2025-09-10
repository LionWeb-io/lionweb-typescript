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

import { SerializedDelta } from "@lionweb/class-core"
import { LionWebId } from "@lionweb/json"
import { asMinimalJsonString } from "@lionweb/ts-utils"

import { Event } from "./payload/event-types.js"
import { clientInfo, clientWarning, repositoryInfo, withStylesApplied } from "./utils/ansi.js"


export interface ISemanticLogItem {
    asText(): string
}


export type SemanticLogger = (semanticLogItem: ISemanticLogItem) => void

export const semanticNoOpLogger: SemanticLogger = (_) => {}

export const semanticLoggerFunctionFrom = (optionalSemanticLogger?: SemanticLogger) =>
    optionalSemanticLogger ?? semanticNoOpLogger

export const semanticConsoleLogger = (semanticLogItem: ISemanticLogItem) => {
    console.log(semanticLogItem.asText())
}


export class DeltaOccurredOnClient implements ISemanticLogItem {
    constructor(public readonly clientId: LionWebId, public readonly serializedDelta: SerializedDelta) {}
    asText = () => `${clientInfo(`delta occurred on client "${this.clientId}"`)}: ${asMinimalJsonString(this.serializedDelta)}`
}

export class ClientSentMessage<TMessageForRepository> implements ISemanticLogItem {
    constructor(public readonly clientId: LionWebId, public readonly message: TMessageForRepository) {}
    asText = () => `${clientInfo(`client "${this.clientId}" sent message`)}: ${asMinimalJsonString(this.message)}`
}

export class ClientReceivedMessage<TMessageForClient> implements ISemanticLogItem {
    constructor(public readonly clientId: LionWebId, public readonly message: TMessageForClient) {}
    asText = () => `${clientInfo(`client "${this.clientId}" received message`)}: ${asMinimalJsonString(this.message)}`
}

export class ClientAppliedEvent implements ISemanticLogItem {
    constructor(public readonly clientId: LionWebId, public readonly event: Event) {}
    asText = () => `${clientInfo(`client "${this.clientId}" applied (the delta from) the following event`)}: ${asMinimalJsonString(this.event)}`
}

export class ClientDidNotApplyEventFromOwnCommand implements ISemanticLogItem {
    constructor(public readonly clientId: LionWebId, public readonly originatingCommandId: LionWebId) {}
    asText = () => clientWarning(`client "${this.clientId}" didn't apply (the delta from) an event because it's the result of a command (with ID="${this.originatingCommandId}") it sent itself`)
}

export class RepositoryReceivedMessage<TClientMetadata, TIncomingMessage> implements ISemanticLogItem {
    constructor(public readonly knownMetadata: Partial<TClientMetadata>, public readonly message: TIncomingMessage) {}
    asText = () => `${repositoryInfo(`repository received message`)} ${withStylesApplied("magenta")(`(client's known metadata: ${asMinimalJsonString(this.knownMetadata)})`)}: ${asMinimalJsonString(this.message)}`
}


export const semanticLogItemsToConsole = (semanticLogItems: ISemanticLogItem[]) => {
    semanticLogItems.forEach((logItem) => {
        console.log(logItem.asText())
    })
}

export const semanticLogItemStorer = (): [semanticLogger: SemanticLogger, semanticLogItems: ISemanticLogItem[]] => {
    const items: ISemanticLogItem[] = []
    return [
        (semanticLogItem) => {
            items.push(semanticLogItem)
        },
        items
    ]
}

