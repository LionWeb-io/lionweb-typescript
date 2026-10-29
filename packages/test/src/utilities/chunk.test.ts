// Copyright 2026 TRUMPF Laser SE and other contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
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

import { LionWebVersions } from "@lionweb/core"
import { looksLikeSerializedLanguages } from "@lionweb/utilities"

import { isFalse, isTrue, throws } from "../test-utils/assertions.js"


describe("looksLikeSerializedLanguages", () => {

    describe("with valid serialization chunks", () => {

        it("returns true for a chunk with LionCore 2023.1 languages", () => {
            const chunk = {
                serializationFormatVersion: "2023.1",
                languages: [
                    { key: "LionCore-M3", version: "2023.1" }
                ],
                nodes: []
            }
            isTrue(looksLikeSerializedLanguages(chunk))
        })

        it("returns true for a chunk with multiple languages including LionCore", () => {
            const chunk = {
                serializationFormatVersion: "2023.1",
                languages: [
                    { key: "http://example.com/mylang", version: "1" },
                    { key: "LionCore-M3", version: "2023.1" }
                ],
                nodes: []
            }
            isTrue(looksLikeSerializedLanguages(chunk))
        })

        it("returns true for a chunk with LionCore language when specific version is provided", () => {
            const chunk = {
                serializationFormatVersion: "2023.1",
                languages: [
                    { key: "LionCore-M3", version: "2023.1" }
                ],
                nodes: []
            }
            isTrue(looksLikeSerializedLanguages(chunk, LionWebVersions.v2023_1))
        })

    })

    describe("with invalid serialization chunks", () => {

        it("returns false for undefined input", () => {
            isFalse(looksLikeSerializedLanguages(undefined))
        })

        it("returns false for string input", () => {
            isFalse(looksLikeSerializedLanguages("string"))
        })

        it("returns false for number input", () => {
            isFalse(looksLikeSerializedLanguages(123))
        })

        it("returns false for boolean input", () => {
            isFalse(looksLikeSerializedLanguages(true))
        })

        it("returns false for array input", () => {
            isFalse(looksLikeSerializedLanguages([]))
        })

        it("throws for null input", () => {
            // Note: This is a known issue in the isRecord function - null passes typeof check
            // The function should handle this, but currently it throws
            // This test documents the current behavior
            throws(() => looksLikeSerializedLanguages(null), TypeError)
        })

        it("returns false when languages property is missing", () => {
            const chunk = {
                serializationFormatVersion: "2023.1",
                nodes: []
            }
            isFalse(looksLikeSerializedLanguages(chunk))
        })

        it("returns false when languages property is not an array", () => {
            const chunk = {
                serializationFormatVersion: "2023.1",
                languages: "not an array",
                nodes: []
            }
            isFalse(looksLikeSerializedLanguages(chunk))
        })

        it("returns false when languages array is empty", () => {
            const chunk = {
                serializationFormatVersion: "2023.1",
                languages: [],
                nodes: []
            }
            isFalse(looksLikeSerializedLanguages(chunk))
        })

        it("returns false when languages array contains non-objects", () => {
            const chunk = {
                serializationFormatVersion: "2023.1",
                languages: ["not a language"],
                nodes: []
            }
            isFalse(looksLikeSerializedLanguages(chunk))
        })

        it("returns false for a chunk without LionCore language", () => {
            const chunk = {
                serializationFormatVersion: "2023.1",
                languages: [
                    { key: "http://example.com/mylang", version: "1" }
                ],
                nodes: []
            }
            isFalse(looksLikeSerializedLanguages(chunk))
        })

        it("returns false for a chunk with wrong serialization format version", () => {
            const chunk = {
                serializationFormatVersion: "9999.9",
                languages: [
                    { key: "LionCore-M3", version: "2023.1" }
                ],
                nodes: []
            }
            isFalse(looksLikeSerializedLanguages(chunk))
        })

        it("returns false for a chunk with LionCore language but wrong version", () => {
            const chunk = {
                serializationFormatVersion: "2023.1",
                languages: [
                    { key: "LionCore-M3", version: "9999.9" }
                ],
                nodes: []
            }
            isFalse(looksLikeSerializedLanguages(chunk))
        })

    })

    describe("with version parameter", () => {

        it("returns true for matching version and LionCore language", () => {
            const chunk = {
                serializationFormatVersion: "2023.1",
                languages: [
                    { key: "LionCore-M3", version: "2023.1" }
                ],
                nodes: []
            }
            isTrue(looksLikeSerializedLanguages(chunk, LionWebVersions.v2023_1))
        })

        it("returns false for non-matching version", () => {
            const chunk = {
                serializationFormatVersion: "2024.1",
                languages: [
                    { key: "LionCore-M3", version: "2024.1" }
                ],
                nodes: []
            }
            isFalse(looksLikeSerializedLanguages(chunk, LionWebVersions.v2023_1))
        })

        it("returns false for matching version but wrong LionCore language", () => {
            const chunk = {
                serializationFormatVersion: "2023.1",
                languages: [
                    { key: "LionCore-M3", version: "2024.1" }
                ],
                nodes: []
            }
            isFalse(looksLikeSerializedLanguages(chunk, LionWebVersions.v2023_1))
        })

    })

})
