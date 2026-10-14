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

import { LionWebJsonChunk, LionWebJsonMetaPointer, LionWebJsonUsedLanguage, LionWebKey } from "@lionweb/json"
import { languagesUsedIn, withUpdatedLanguageVersions } from "@lionweb/utilities"

import { deepEqual } from "../test-utils/assertions.js"


describe("version updater (function)", () => {

    const bumpLanguage_v0: LionWebJsonUsedLanguage = { key: "lang-to-bump", version: "0" }
    const leaveLanguage_v1: LionWebJsonUsedLanguage = { key: "lang-to-leave", version: "1" }

    const metaPointer = (language: LionWebJsonUsedLanguage, key: LionWebKey): LionWebJsonMetaPointer => ({
        language: language.key,
        version: language.version,
        key
    })

    const chunk: LionWebJsonChunk = {
        serializationFormatVersion: "2023.1",
        languages: [
            bumpLanguage_v0,
            leaveLanguage_v1
        ],
        nodes: [
            {
                id: "bump-node",
                classifier: metaPointer(bumpLanguage_v0, "AConcept"),
                properties: [
                    {
                        property: metaPointer(bumpLanguage_v0, "AConcept_bumpProp"),
                        value: null
                    },
                    {
                        property: metaPointer(leaveLanguage_v1, "AConcept_leaveProp"),
                        value: null
                    }
                ],
                containments: [
                    {
                        containment: metaPointer(bumpLanguage_v0, "AConcept_bumpCont"),
                        children: []
                    },
                    {
                        containment: metaPointer(leaveLanguage_v1, "AConcept_leaveCont"),
                        children: []
                    }
                ],
                references: [
                    {
                        reference: metaPointer(bumpLanguage_v0, "AConcept_bumpRef"),
                        targets: []
                    },
                    {
                        reference: metaPointer(leaveLanguage_v1, "AConcept_leaveRef"),
                        targets: []
                    }
                ],
                annotations: [ "bump-anno" ],
                parent: null
            },
            {
                id: "bump-anno",
                classifier: metaPointer(bumpLanguage_v0, "AAnnotation"),
                properties: [],
                containments: [],
                references: [],
                annotations: [],
                parent: "bump-node"
            },
            {
                id: "leave-node",
                classifier: metaPointer(leaveLanguage_v1, "BConcept"),
                properties: [
                    {
                        property: metaPointer(bumpLanguage_v0, "BConcept_bumpProp"),
                        value: null
                    },
                    {
                        property: metaPointer(leaveLanguage_v1, "BConcept_leaveProp"),
                        value: null
                    }
                ],
                containments: [
                    {
                        containment: metaPointer(bumpLanguage_v0, "BConcept_bumpCont"),
                        children: []
                    },
                    {
                        containment: metaPointer(leaveLanguage_v1, "BConcept_leaveCont"),
                        children: []
                    }
                ],
                references: [
                    {
                        reference: metaPointer(bumpLanguage_v0, "BConcept_bumpRef"),
                        targets: []
                    },
                    {
                        reference: metaPointer(leaveLanguage_v1, "BConcept_leaveRef"),
                        targets: []
                    }
                ],
                annotations: [ "leave-anno" ],
                parent: null,
            },
            {
                id: "leave-anno",
                classifier: metaPointer(leaveLanguage_v1, "BAnnotation"),
                properties: [],
                containments: [],
                references: [],
                annotations: [],
                parent: "leave-node"
            }
        ]
    }

    it("languagesUsedIn works", () => {
        deepEqual(
            languagesUsedIn(chunk),
            {
                [bumpLanguage_v0.key]: [bumpLanguage_v0.version],
                [leaveLanguage_v1.key]: [leaveLanguage_v1.version]
            }
        )
    })

    it("no configuration => no change", () => {
        deepEqual(withUpdatedLanguageVersions(chunk, {}), chunk)
    })

    it("deepEqual of maps disregards key order", () => {
        deepEqual({ "a": "1", "b": "2" }, { "b": "2", "a": "1" })
    })

    it("updating all versions -> 2 with an overallReplacementVersion", () => {
        const updatedChunk = withUpdatedLanguageVersions(chunk, { overallReplacementVersion: "2" })
        deepEqual(
            updatedChunk.languages,
            [
                { key: bumpLanguage_v0.key, version: "2" },
                { key: leaveLanguage_v1.key, version: "2" },
            ]
        )
        deepEqual(
            languagesUsedIn(updatedChunk),
            {
                [bumpLanguage_v0.key]: ["2"],
                [leaveLanguage_v1.key]: ["2"]
            }
        )
    })

    it("updating version 0 -> 1 for bump language", () => {
        const updatedChunk = withUpdatedLanguageVersions(chunk, { versionMap: { "lang-to-bump": "1" } })
        deepEqual(
            updatedChunk.languages,
            [
                { key: bumpLanguage_v0.key, version: "1" },
                { key: leaveLanguage_v1.key, version: "1" },
            ]
        )
        deepEqual(
            languagesUsedIn(updatedChunk),
            {
                [bumpLanguage_v0.key]: ["1"],
                [leaveLanguage_v1.key]: ["1"]
            }
        )
    })

    it("updating version 0 -> 1 for bump language, and -> 2 with an overallReplacementVersion", () => {
        const updatedChunk = withUpdatedLanguageVersions(chunk, { versionMap: { "lang-to-bump": "1" }, overallReplacementVersion: "2" })
        deepEqual(
            updatedChunk.languages,
            [
                { key: bumpLanguage_v0.key, version: "1" },
                { key: leaveLanguage_v1.key, version: "2" },
            ]
        )
        deepEqual(
            languagesUsedIn(updatedChunk),
            {
                [bumpLanguage_v0.key]: ["1"],
                [leaveLanguage_v1.key]: ["2"]
            }
        )
    })

})

