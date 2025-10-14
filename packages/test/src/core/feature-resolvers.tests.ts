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

import { featureResolversFor, metaPointerFor } from "@lionweb/core"

import { equal, throws } from "../test-utils/assertions.js"
import {
    aConcept,
    aConcept_aContainment,
    aConcept_aProperty,
    aConcept_aReference, anInterface,
    metaLanguage
} from "../languages/meta.js"


describe("feature resolvers", () => {

    const featureResolvers = () =>
        featureResolversFor([metaLanguage])

    it("find features that are there", () => {
        const { resolvedPropertyFrom, resolvedContainmentFrom, resolvedReferenceFrom } = featureResolvers()

        equal(
            resolvedPropertyFrom(metaPointerFor(aConcept_aProperty), aConcept),
            aConcept_aProperty
        )

        equal(
            resolvedContainmentFrom(metaPointerFor(aConcept_aContainment), aConcept),
            aConcept_aContainment
        )

        equal(
            resolvedReferenceFrom(metaPointerFor(aConcept_aReference), aConcept),
            aConcept_aReference
        )
    })

    it("throw on features of the wrong meta-type", () => {
        const { resolvedPropertyFrom, resolvedContainmentFrom, resolvedReferenceFrom } = featureResolvers()

        throws(
            () => {
                resolvedPropertyFrom(metaPointerFor(aConcept_aContainment), aConcept)
            },
            `feature with meta-pointer {"language":"meta","version":"1","key":"aContainment"} on classifier with meta-pointer {"language":"meta","version":"1","key":"AConcept"} is not a Property but a Containment`
        )

        throws(
            () => {
                resolvedContainmentFrom(metaPointerFor(aConcept_aReference), aConcept)
            },
            `feature with meta-pointer {"language":"meta","version":"1","key":"aReference"} on classifier with meta-pointer {"language":"meta","version":"1","key":"AConcept"} is not a Containment but a Reference`
        )

        throws(
            () => {
                resolvedReferenceFrom(metaPointerFor(aConcept_aProperty), aConcept)
            },
            `feature with meta-pointer {"language":"meta","version":"1","key":"aProperty"} on classifier with meta-pointer {"language":"meta","version":"1","key":"AConcept"} is not a Reference but a Property`
        )
    })

    it("throw on features that aren't there", () => {
        const { resolvedPropertyFrom, resolvedContainmentFrom, resolvedReferenceFrom } = featureResolvers()

        throws(
            () => {
                resolvedPropertyFrom(metaPointerFor(aConcept_aProperty), anInterface)
            },
            `couldn't resolve feature with meta-pointer {"language":"meta","version":"1","key":"aProperty"} on classifier with meta-pointer {"language":"meta","version":"1","key":"AnInterface"}`
        )

        throws(
            () => {
                resolvedContainmentFrom(metaPointerFor(aConcept_aContainment), anInterface)
            },
            `couldn't resolve feature with meta-pointer {"language":"meta","version":"1","key":"aContainment"} on classifier with meta-pointer {"language":"meta","version":"1","key":"AnInterface"}`
        )

        throws(
            () => {
                resolvedReferenceFrom(metaPointerFor(aConcept_aReference), anInterface)
            },
            `couldn't resolve feature with meta-pointer {"language":"meta","version":"1","key":"aReference"} on classifier with meta-pointer {"language":"meta","version":"1","key":"AnInterface"}`
        )
    })

})

