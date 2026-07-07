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

// TODO  check that look up by resolveInfo works as expected

import { allLionWebVersions, LionWebVersions } from "@lionweb/core"

import { expect } from "chai"


describe("LionWeb version", () => {

    describe("lookup of built-in LionCore M3-nodes by resolveInfo", () => {

        it("no lookup in version 2023.1", () => {
            expect(
                LionWebVersions.v2023_1.lookUpBuiltinLionCoreNodeBy("LionWeb.LionCore_M3.Annotation")
            ).to.equal(undefined)
        })

        for (const version of allLionWebVersions.filter((version) => version !== LionWebVersions.v2023_1)) {
            it(`lookup in version ${version.serializationFormatVersion}`, () => {
                expect(
                    version.lookUpBuiltinLionCoreNodeBy("LionWeb.LionCore_M3.Annotation")
                ).to.equal(version.lioncoreFacade.metaConcepts.annotation)
                expect(
                    version.lookUpBuiltinLionCoreNodeBy("LionWeb.LionCore_M3.Concept.abstract")
                ).to.equal(version.lioncoreFacade.metaFeatures.concept_abstract)
                expect(
                    version.lookUpBuiltinLionCoreNodeBy("LionWeb.LionCore_builtins.String")
                ).to.equal(version.builtinsFacade.primitiveTypes.stringDataType)
                expect(
                    version.lookUpBuiltinLionCoreNodeBy("LionWeb.LionCore_builtins.INamed.name")
                ).to.equal(version.builtinsFacade.features.inamed_name)
            })
        }

    })

})

