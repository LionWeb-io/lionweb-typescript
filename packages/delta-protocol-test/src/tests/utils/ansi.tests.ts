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

import { expect } from "chai"

import { colors, styles, withColorAndStyleApplied } from "@lionweb/delta-protocol-impl/dist/utils/ansi.js"


describe("ANSI colors", function() {

    it("works", async function() {
        const check = (color: keyof typeof colors, style: keyof typeof styles, text: string, expected: string) => {
            const ansiText = withColorAndStyleApplied(color, style)(text)
            console.log(ansiText)
            expect(ansiText).to.equal(expected)
        }
        check("red", "default", "red", "\x1b[;31mred\x1b[0m")
        check("magenta", "bold", "magenta+bold", "\x1b[1;35mmagenta+bold\x1b[0m")
        check("cyan", "italic", "cyan+italic", "\x1b[3;36mcyan+italic\x1b[0m")
    })

})

