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

import { INodeBase } from "@lionweb/class-core"
import { LionWebClient } from "@lionweb/delta-protocol-impl"
import { LionWebId } from "@lionweb/json"
import { ClientReceivedMessage, ISemanticLogItem } from "@lionweb/delta-protocol-impl/dist/semantic-logging.js"
import { clientInfo, withColorAndStyleApplied } from "@lionweb/delta-protocol-impl/dist/utils/ansi.js"
import { waitUntil } from "@lionweb/delta-protocol-impl/dist/utils/async.js"
import { Documentation, Geometry, ShapesBase } from "./gen/Shapes.g.js"
import { DataTypeTestConcept, LinkTestConcept, TestAnnotation, TestLanguageBase } from "./gen/TestLanguage.g.js"


const lastOf = <T>(ts: T[]): T => {
    if (ts.length === 0) {
        throw new Error(`empty array doesn't have a last element`)
    }
    return ts[ts.length - 1]
}


export const recognizedTasks: Record<string, boolean> = {
    "SignOn": true,
    "SignOff": true,
    "Wait": true,
    "AddDocs": true,
    "SetDocsText": true,
    "AddStringValue_0_1": true,
    "SetStringValue_0_1": true,
    "DeleteStringValue_0_1": true,
    "AddAnnotation": true,
    "AddAnnotations": true,
    "AddAnnotation_to_Containment_0_1": true,
    "DeleteAnnotation": true,
    "MoveAnnotationInSameParent": true,
    "MoveAnnotationFromOtherParent": true,
    "AddReference_0_1_to_Containment_0_1": true,
    "AddReference_0_1_to_Containment_1": true,
    "DeleteReference_0_1": true,
    "AddContainment_0_1": true,
    "AddContainment_1": true,
    "ReplaceContainment_0_1": true,
    "DeleteContainment_0_1": true,
    "AddContainment_0_1_Containment_0_1": true,
    "AddContainment_1_Containment_0_1": true,
    "AddContainment_0_n": true,
    "AddContainment_1_n": true,
    "MoveAndReplaceChildFromOtherContainment_Single": true,
    "MoveAndReplaceChildFromOtherContainmentInSameParent_Single": true,
    "MoveAndReplaceChildFromOtherContainment_Multiple": true,
    "MoveChildInSameContainment": true,
    "MoveChildFromOtherContainment_Single": true,
    "MoveChildFromOtherContainment_Multiple": true,
    "MoveChildFromOtherContainmentInSameParent_Single": true,
    "MoveChildFromOtherContainmentInSameParent_Multiple": true,
    "AddPartition": true
}


const shapesLanguageBase = ShapesBase.INSTANCE
const testLanguageBase = TestLanguageBase.INSTANCE


export const taskExecutor = (lionWebClient: LionWebClient, partition: INodeBase, semanticLogItems: ISemanticLogItem[]) => {

    const numberOfReceivedMessages = () =>
        semanticLogItems.filter((item) => item instanceof ClientReceivedMessage).length

    const waitForReceivedMessages = async (numberOfMessagesToReceive: number) => {
        const expectedNumber = numberOfReceivedMessages() + numberOfMessagesToReceive  // (precompute here)
        return waitUntil(10, () => numberOfReceivedMessages() >= expectedNumber)
            .then(() => {
                console.log(clientInfo(`(client "${lionWebClient.clientId}" received a total of ${numberOfReceivedMessages()} messages so far)`))
            })
    }

    const annotation = (id: LionWebId) =>
        lionWebClient.createNode(testLanguageBase.TestAnnotation, id) as TestAnnotation

    const linkTestConcept = (id?: LionWebId) =>
        id === undefined
            ? partition as LinkTestConcept
            : lionWebClient.createNode(testLanguageBase.LinkTestConcept, id) as LinkTestConcept

    return async (task: string, queryId: string) => {
        console.log(clientInfo(`client "${lionWebClient.clientId}" is executing task "${task}"`))
        switch (task) {
            case "SignOn":
                return await lionWebClient.signOn(queryId)
            case "SignOff":
                return await lionWebClient.signOff(queryId)
            case "Wait": {
                return waitForReceivedMessages(1)
            }
            case "AddDocs": {
                (partition as Geometry).documentation = lionWebClient.createNode(shapesLanguageBase.Documentation, "documentation") as Documentation
                return waitForReceivedMessages(1)
            }
            case "SetDocsText": {
                (partition as Geometry).documentation!.text = "hello there"
                return waitForReceivedMessages(1)
            }
            case "AddStringValue_0_1":
                (partition as DataTypeTestConcept).stringValue_0_1 = "new property"
                return waitForReceivedMessages(1)
            case "SetStringValue_0_1":
                (partition as DataTypeTestConcept).stringValue_0_1 = "changed property"
                return waitForReceivedMessages(1)
            case "DeleteStringValue_0_1":
                (partition as DataTypeTestConcept).stringValue_0_1 = undefined
                return waitForReceivedMessages(1)
            case "AddAnnotation":
                linkTestConcept().addAnnotation(annotation("annotation"))
                return waitForReceivedMessages(1)
            case "AddAnnotations":
                linkTestConcept().addAnnotation(annotation("annotation0"));   // (keep ;!)
                linkTestConcept().addAnnotation(annotation("annotation1"))
                return waitForReceivedMessages(2)
            case "AddAnnotation_to_Containment_0_1":
                linkTestConcept().containment_0_1!.addAnnotation(annotation("annotation"))
                return waitForReceivedMessages(1)
            case "DeleteAnnotation":
                linkTestConcept().removeAnnotation(linkTestConcept().annotations[0])
                return waitForReceivedMessages(1)
            case "MoveAnnotationInSameParent":
                linkTestConcept().insertAnnotationAtIndex(lastOf(linkTestConcept().annotations), 0)
                return waitForReceivedMessages(1)
            case "MoveAnnotationFromOtherParent":
                linkTestConcept().addAnnotation(linkTestConcept().containment_0_1!.annotations[0])
                return waitForReceivedMessages(1)
            case "AddReference_0_1_to_Containment_0_1":
                linkTestConcept().reference_0_1 = linkTestConcept().containment_0_1
                return waitForReceivedMessages(1)
            case "AddReference_0_1_to_Containment_1":
                linkTestConcept().reference_0_1 = linkTestConcept().containment_1
                return waitForReceivedMessages(1)
            case "DeleteReference_0_1":
                linkTestConcept().reference_0_1 = undefined
                return waitForReceivedMessages(1)
            case "AddContainment_0_1":
                linkTestConcept().containment_0_1 = linkTestConcept("containment_0_1")
                return waitForReceivedMessages(1)
            case "AddContainment_1":
                linkTestConcept().containment_1 = linkTestConcept("containment_1")
                return waitForReceivedMessages(1)
            case "ReplaceContainment_0_1":
                linkTestConcept().containment_0_1 = linkTestConcept("substitute")
                return waitForReceivedMessages(1)
            case "DeleteContainment_0_1":
                linkTestConcept().containment_0_1 = undefined
                return waitForReceivedMessages(1)
            case "AddContainment_0_1_Containment_0_1":
                linkTestConcept().containment_0_1!.containment_0_1 = linkTestConcept("containment_0_1_containment_0_1")
                return waitForReceivedMessages(1)
            case "AddContainment_1_Containment_0_1":
                linkTestConcept().containment_1.containment_0_1 = linkTestConcept("containment_1_containment_0_1")
                return waitForReceivedMessages(1)
            case "AddContainment_0_n":
                linkTestConcept().addContainment_0_n(linkTestConcept("containment_0_n_child0"));   // (keep ;!)
                linkTestConcept().addContainment_0_n(linkTestConcept("containment_0_n_child1"))
                return waitForReceivedMessages(2)
            case "AddContainment_1_n":
                linkTestConcept().addContainment_1_n(linkTestConcept("containment_1_n_child0"));   // (keep ;!)
                linkTestConcept().addContainment_1_n(linkTestConcept("containment_1_n_child1"))
                return waitForReceivedMessages(2)
            case "MoveAndReplaceChildFromOtherContainment_Single":
                linkTestConcept().containment_1.replaceContainment_0_1With(linkTestConcept().containment_0_1!.containment_0_1!)
                return waitForReceivedMessages(1)
            case "MoveAndReplaceChildFromOtherContainmentInSameParent_Single":
                linkTestConcept().replaceContainment_1With(linkTestConcept().containment_0_1!)
                return waitForReceivedMessages(1)
            case "MoveAndReplaceChildFromOtherContainment_Multiple":
                linkTestConcept().replaceContainment_1_nAtIndex(lastOf(linkTestConcept().containment_0_n), linkTestConcept().containment_1_n.length - 1)
                return waitForReceivedMessages(1)
            case "MoveChildInSameContainment":
                linkTestConcept().addContainment_0_nAtIndex(lastOf(linkTestConcept().containment_0_n), 0)
                return waitForReceivedMessages(1)
            case "MoveChildFromOtherContainment_Single":
                linkTestConcept().containment_1 = linkTestConcept().containment_0_1!.containment_0_1!
                return waitForReceivedMessages(1)
            case "MoveChildFromOtherContainment_Multiple":
                linkTestConcept().addContainment_1_nAtIndex(lastOf(linkTestConcept().containment_0_n).containment_0_n[0], 1)
                return waitForReceivedMessages(1)
            case "MoveChildFromOtherContainmentInSameParent_Single":
                linkTestConcept().containment_1 = linkTestConcept().containment_0_1!
                return waitForReceivedMessages(1)
            case "MoveChildFromOtherContainmentInSameParent_Multiple":
                linkTestConcept().addContainment_1_nAtIndex(lastOf(linkTestConcept().containment_0_n), 1)
                return waitForReceivedMessages(1)
            case "AddPartition":
                lionWebClient.addPartition(linkTestConcept("partition"))
                return waitForReceivedMessages(1)

            default: {
                console.log(withColorAndStyleApplied("red", "italic")(`task "${task}" is unknown => ignored`))
                return Promise.resolve()
            }
        }
    }
}

