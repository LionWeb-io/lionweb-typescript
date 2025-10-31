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

import { collectingDeltaReceiver, PropertyAddedDelta } from "@lionweb/class-core"
import { AddPropertyCommand, deltaToCommandTranslator } from "@lionweb/delta-protocol-common"

import { expect } from "chai"
import { MaterialGroup, MatterState, ShapesBase } from "../gen/Shapes.g.js"

const shapeLanguageBase = ShapesBase.INSTANCE


describe("delta-to-command translator", () => {

    it("works for changing an enumeration-typed property", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const materialGroup = MaterialGroup.create("mg", receiveDelta);

        // pre-check:
        expect(materialGroup.matterState).to.equal(undefined);
        expect(deltas.length).to.equal(0);

        // action+check:
        materialGroup.matterState = MatterState.solid;
        expect(deltas.length).to.equal(1);
        expect(deltas[0]).to.deep.equal(new PropertyAddedDelta(materialGroup, shapeLanguageBase.MaterialGroup_matterState, MatterState.solid));

        const deltaAsCommand = deltaToCommandTranslator();
        const command = deltaAsCommand(deltas[0], "cmd-1");
        expect(command).to.deep.equal({
            messageKind: "AddProperty",
            node: "mg",
            property: { language: shapeLanguageBase.language.key, version: shapeLanguageBase.language.version, key: shapeLanguageBase.MaterialGroup_matterState.key },
            newValue: "key-solid",
            commandId: "cmd-1",
            protocolMessages: []
        } as AddPropertyCommand);
    });

});

