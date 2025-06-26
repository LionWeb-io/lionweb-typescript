// SPDX-FileCopyrightText: 2025 TRUMPF Laser SE
//
// SPDX-License-Identifier: LicenseRef-TRUMPF

import { asString } from "littoral-templates"

/**
 * @return the given string, reversed — "abc" -> "cba"
 * Note: only used to hack around the REUSE compliance checker!
 */
const reverseString = (str: string) =>
    str.split("").reverse().join("")

/**
 * The license header (as //-styled comments) for code originating from Trumpf Laser SE, licensed under Apache-2.0.
 */
const trumpfOriginatingApache2_0LicenseHeaderComments = `// Copyright 2025 TRUMPF Laser SE and other contributors
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
// ${reverseString("txeTthgirypoCeliF-XDPS")}: 2025 TRUMPF Laser SE and other contributors
// ${reverseString("reifitnedI-esneciL-XDPS")}: Apache-2.0`

/**
 * Generic (//-styled) comments warning about code being generated.
 */
export const generatedCodeWarningComments = `// Warning: this file is generated!
// Modifying it by hand is useless at best, and sabotage at worst.`

/**
 * The empty line-separation concatenation of the Trumpf-flavored Apache-2.0 license header and the generation warning.
 */
export const defaultTrumpfOriginatingApache2_0LicensedHeader =
    asString([trumpfOriginatingApache2_0LicenseHeaderComments, ``, generatedCodeWarningComments])

