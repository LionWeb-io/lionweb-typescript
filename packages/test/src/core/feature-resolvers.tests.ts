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
import { TestLanguageBase } from "@lionweb/class-core-test-language"

const base = TestLanguageBase.INSTANCE

describe("feature resolvers", () => {

    const featureResolvers = () =>
        featureResolversFor([base.language])

    it("find features that are there", () => {
        const { resolvedPropertyFrom, resolvedContainmentFrom, resolvedReferenceFrom } = featureResolvers()

        equal(
            resolvedPropertyFrom(metaPointerFor(base.DataTypeTestConcept_stringValue_1), base.DataTypeTestConcept),
            base.DataTypeTestConcept_stringValue_1
        )

        equal(
            resolvedContainmentFrom(metaPointerFor(base.LinkTestConcept_containment_1), base.LinkTestConcept),
            base.LinkTestConcept_containment_1
        )

        equal(
            resolvedReferenceFrom(metaPointerFor(base.LinkTestConcept_reference_1), base.LinkTestConcept),
            base.LinkTestConcept_reference_1
        )
    })

    it("throw on features of the wrong meta-type", () => {
        const { resolvedPropertyFrom, resolvedContainmentFrom, resolvedReferenceFrom } = featureResolvers()

        throws(
            () => {
                resolvedPropertyFrom(metaPointerFor(base.LinkTestConcept_containment_1), base.LinkTestConcept)
            },
            `feature with meta-pointer {"language":"TestLanguage","version":"0","key":"LinkTestConcept-containment_1"} on classifier with meta-pointer {"language":"TestLanguage","version":"0","key":"LinkTestConcept"} is not a Property but a Containment`
        )

        throws(
            () => {
                resolvedContainmentFrom(metaPointerFor(base.LinkTestConcept_reference_1), base.LinkTestConcept)
            },
            `feature with meta-pointer {"language":"TestLanguage","version":"0","key":"LinkTestConcept-reference_1"} on classifier with meta-pointer {"language":"TestLanguage","version":"0","key":"LinkTestConcept"} is not a Containment but a Reference`
        )

        throws(
            () => {
                resolvedReferenceFrom(metaPointerFor(base.DataTypeTestConcept_stringValue_1), base.DataTypeTestConcept)
            },
            `feature with meta-pointer {"language":"TestLanguage","version":"0","key":"DataTypeTestConcept-stringValue_1"} on classifier with meta-pointer {"language":"TestLanguage","version":"0","key":"DataTypeTestConcept"} is not a Reference but a Property`
        )
    })

    it("throw on features that aren't there", () => {
        const { resolvedPropertyFrom, resolvedContainmentFrom, resolvedReferenceFrom } = featureResolvers()

        throws(
            () => {
                resolvedPropertyFrom(metaPointerFor(base.DataTypeTestConcept_stringValue_1), base.TestAnnotation)
            },
            `couldn't resolve feature with meta-pointer {"language":"TestLanguage","version":"0","key":"DataTypeTestConcept-stringValue_1"} on classifier with meta-pointer {"language":"TestLanguage","version":"0","key":"TestAnnotation"}`
        )

        throws(
            () => {
                resolvedContainmentFrom(metaPointerFor(base.LinkTestConcept_containment_1), base.TestAnnotation)
            },
            `couldn't resolve feature with meta-pointer {"language":"TestLanguage","version":"0","key":"LinkTestConcept-containment_1"} on classifier with meta-pointer {"language":"TestLanguage","version":"0","key":"TestAnnotation"}`
        )

        throws(
            () => {
                resolvedReferenceFrom(metaPointerFor(base.LinkTestConcept_reference_1), base.TestAnnotation)
            },
            `couldn't resolve feature with meta-pointer {"language":"TestLanguage","version":"0","key":"LinkTestConcept-reference_1"} on classifier with meta-pointer {"language":"TestLanguage","version":"0","key":"TestAnnotation"}`
        )
    })

})

